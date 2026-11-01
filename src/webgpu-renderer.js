const WORKGROUP_SIZE = 256;
const PHONE_VEC4S = 4;

const shaderCode = `
struct Params {
  sampleCount: u32,
  phoneCount: u32,
  sampleRate: f32,
  baseType: u32,
  formantsEnabled: u32,
  whisperMode: u32,
  chunkStart: u32,
  padding: u32,
};

@group(0) @binding(0) var<storage, read> phones: array<vec4<f32>>;
@group(0) @binding(1) var<storage, read_write> samples: array<f32>;
@group(0) @binding(2) var<uniform> params: Params;

const TAU: f32 = 6.28318530718;

fn gaussian(value: f32, center: f32, width: f32) -> f32 {
  let distance = (value - center) / max(width, 1.0);
  return exp(-0.5 * distance * distance);
}

fn noise(sampleIndex: u32, phoneIndex: u32) -> f32 {
  var value = sampleIndex * 1664525u + phoneIndex * 1013904223u + 374761393u;
  value = (value ^ (value >> 16u)) * 2246822519u;
  value = (value ^ (value >> 13u)) * 3266489917u;
  value = value ^ (value >> 16u);
  return f32(value & 16777215u) / 8388607.5 - 1.0;
}

fn waveform(phase: f32, oscillatorType: u32) -> f32 {
  let cycle = fract(phase / TAU);
  if (oscillatorType == 2u) {
    return 2.0 * cycle - 1.0;
  }
  if (oscillatorType == 3u) {
    return select(-1.0, 1.0, cycle < 0.5);
  }
  if (oscillatorType == 4u) {
    return 1.0 - 4.0 * abs(cycle - 0.5);
  }
  if (oscillatorType == 1u) {
    let pulse = select(0.0, 1.0, cycle < 0.35);
    return (pulse - 0.35) * 2.0;
  }
  return sin(phase);
}

@compute @workgroup_size(256)
fn render(@builtin(global_invocation_id) invocation: vec3<u32>) {
  let sampleIndex = params.chunkStart + invocation.x;
  if (sampleIndex >= params.sampleCount) {
    return;
  }

  let time = f32(sampleIndex) / params.sampleRate;
  var result = 0.0;
  for (var phoneIndex = 0u; phoneIndex < params.phoneCount; phoneIndex += 1u) {
    let timing = phones[phoneIndex * 4u];
    let timbre = phones[phoneIndex * 4u + 1u];
    let source = phones[phoneIndex * 4u + 2u];
    let phaseData = phones[phoneIndex * 4u + 3u];
    let start = timing.x;
    let duration = timing.y;
    if (time < start || time >= start + duration) {
      continue;
    }

    let localTime = time - start;
    let isVoiced = source.x > 0.5 && params.whisperMode == 0u;
    if (!isVoiced) {
      if (params.whisperMode != 0u || source.x < 0.5) {
        result = noise(sampleIndex, phoneIndex) * timbre.w * source.z * 0.025;
      }
      continue;
    }

    let pitchStart = timing.z;
    let pitchEnd = timing.w;
    let pitchSlope = (pitchEnd - pitchStart) / max(duration, 0.000001);
    let phase = TAU * (phaseData.w + pitchStart * localTime + 0.5 * pitchSlope * localTime * localTime);
    let oscillatorType = u32(max(0.0, phaseData.y));
    var voicedSample = waveform(phase, oscillatorType);

    if (params.formantsEnabled != 0u) {
      var shaped = 0.0;
      var weightSum = 0.0;
      for (var harmonic = 1u; harmonic <= 32u; harmonic += 1u) {
        let harmonicFrequency = f32(harmonic) * (pitchStart + pitchSlope * localTime);
        let weight = (
          gaussian(harmonicFrequency, timbre.x, max(90.0, timbre.x * 0.22)) +
          gaussian(harmonicFrequency, timbre.y, max(120.0, timbre.y * 0.2)) +
          gaussian(harmonicFrequency, timbre.z, max(180.0, timbre.z * 0.18))
        ) / f32(harmonic);
        shaped += sin(phase * f32(harmonic)) * weight;
        weightSum += weight;
      }
      if (weightSum > 0.0001) {
        voicedSample = shaped / weightSum;
      }
    }

    let fade = min(0.008, duration * 0.2);
    let fadeIn = min(1.0, localTime / max(fade, 0.0001));
    let fadeOut = min(1.0, (duration - localTime) / max(fade, 0.0001));
    result = voicedSample * timbre.w * 0.22 * min(fadeIn, fadeOut);
  }
  samples[invocation.x] = result;
}
`;

let devicePromise;

async function getDevice() {
  const gpu = globalThis.navigator?.gpu;
  if (!gpu) return null;
  if (!devicePromise) {
    devicePromise = (async () => {
      const adapter = await gpu.requestAdapter();
      return adapter ? adapter.requestDevice() : null;
    })();
  }
  try {
    return await devicePromise;
  } catch {
    devicePromise = undefined;
    return null;
  }
}

export async function renderWithWebGPU(context, phonemes, {
  mode,
  oscillatorType,
  disableFormantFilter,
}) {
  const device = await getDevice();
  if (!device) return null;

  const sampleCount = context.length;
  const sampleRate = context.sampleRate;
  const totalDuration = sampleCount / sampleRate;
  const phoneData = new Float32Array(phonemes.length * PHONE_VEC4S * 4);
  let startTime = 0;
  let phaseCycles = 0;

  const oscillatorTypeId = type => ({
    rosenberg: 0,
    lf: 1,
    sawtooth: 2,
    square: 3,
    custom: 4,
  })[type] ?? 0;

  phonemes.forEach((phoneme, index) => {
    const offset = index * PHONE_VEC4S * 4;
    const duration = Math.max(0, phoneme.d);
    const pitch = Number.isFinite(phoneme.pitch) ? phoneme.pitch : 120;
    const pitchEnd = Number.isFinite(phoneme.pitchEnd) ? phoneme.pitchEnd : pitch;
    const isVoiced = phoneme.voiced === true;
    const selectedType = oscillatorTypeId(phoneme.oscillatorType ?? oscillatorType);
    const f = phoneme.f ?? [];
    const amplitude = phoneme.key === "rest" ? 0 : (phoneme.amp ?? 0.9);
    const noiseAmplitude = phoneme.key === "rest" ? 0 : (phoneme.noiseAmp ?? 1);

    phoneData.set(
      [startTime, duration, pitch, pitchEnd],
      offset,
    );
    phoneData.set(
      [f[0] ?? 0, f[1] ?? 0, f[2] ?? 0, amplitude],
      offset + 4,
    );
    phoneData.set(
      [isVoiced ? 1 : 0, selectedType, noiseAmplitude, 0],
      offset + 8,
    );
    phoneData.set(
      [0, 0, 0, phaseCycles],
      offset + 12,
    );
    if (isVoiced) phaseCycles += ((pitch + pitchEnd) / 2) * duration;
    startTime += duration;
  });

  if (totalDuration <= 0) return null;

  const shaderModule = device.createShaderModule({ code: shaderCode });
  const compilationMessages = await shaderModule.getCompilationInfo();
  const compilationErrors = compilationMessages.messages.filter(message => message.type === "error");
  if (compilationErrors.length) {
    throw new Error(`WebGPU shader compilation failed: ${compilationErrors.map(message => message.message).join("; ")}`);
  }
  const pipeline = await device.createComputePipelineAsync({
    layout: "auto",
    compute: { module: shaderModule, entryPoint: "render" },
  });

  if (
    phoneData.byteLength > device.limits.maxStorageBufferBindingSize ||
    phoneData.byteLength > device.limits.maxBufferSize
  ) {
    return null;
  }

  const phoneBuffer = device.createBuffer({
    size: Math.max(16, phoneData.byteLength),
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(phoneBuffer, 0, phoneData);

  const paramsBuffer = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const output = new Float32Array(sampleCount);
  const maxOutputBytes = Math.min(
    device.limits.maxStorageBufferBindingSize,
    device.limits.maxBufferSize,
    device.limits.maxComputeWorkgroupsPerDimension * WORKGROUP_SIZE * Float32Array.BYTES_PER_ELEMENT,
  );
  const samplesPerChunk = Math.floor(maxOutputBytes / Float32Array.BYTES_PER_ELEMENT);
  if (samplesPerChunk < 1) throw new RangeError("WebGPU device cannot allocate an audio output buffer.");

  const maxChunkSamples = Math.min(samplesPerChunk, WORKGROUP_SIZE * device.limits.maxComputeWorkgroupsPerDimension);
  const constants = new ArrayBuffer(32);
  const constantsView = new DataView(constants);

  for (let chunkStart = 0; chunkStart < sampleCount; chunkStart += maxChunkSamples) {
    const chunkCount = Math.min(maxChunkSamples, sampleCount - chunkStart);
    const byteLength = chunkCount * Float32Array.BYTES_PER_ELEMENT;
    const outputBuffer = device.createBuffer({
      size: byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });
    const readbackBuffer = device.createBuffer({
      size: byteLength,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });

    constantsView.setUint32(0, sampleCount, true);
    constantsView.setUint32(4, phonemes.length, true);
    constantsView.setFloat32(8, sampleRate, true);
    constantsView.setUint32(12, oscillatorTypeId(oscillatorType), true);
    constantsView.setUint32(16, disableFormantFilter ? 0 : 1, true);
    constantsView.setUint32(20, mode === "whisper" ? 1 : 0, true);
    constantsView.setUint32(24, chunkStart, true);
    constantsView.setUint32(28, 0, true);
    device.queue.writeBuffer(paramsBuffer, 0, constants);

    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: phoneBuffer } },
        { binding: 1, resource: { buffer: outputBuffer } },
        { binding: 2, resource: { buffer: paramsBuffer } },
      ],
    });
    const commandEncoder = device.createCommandEncoder();
    const pass = commandEncoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(Math.ceil(chunkCount / WORKGROUP_SIZE));
    pass.end();
    commandEncoder.copyBufferToBuffer(outputBuffer, 0, readbackBuffer, 0, byteLength);
    device.queue.submit([commandEncoder.finish()]);
    await readbackBuffer.mapAsync(GPUMapMode.READ);
    output.set(new Float32Array(readbackBuffer.getMappedRange()).slice(), chunkStart);
    readbackBuffer.unmap();
    outputBuffer.destroy();
    readbackBuffer.destroy();
  }

  phoneBuffer.destroy();
  paramsBuffer.destroy();
  const audioBuffer = context.createBuffer(1, sampleCount, sampleRate);
  audioBuffer.getChannelData(0).set(output);
  return audioBuffer;
}
