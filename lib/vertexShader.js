const vertexShaderSource = `
attribute vec4 aVertexPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
void main() {
  vec4 vpos = aVertexPosition;
  gl_Position = uProjectionMatrix * uModelViewMatrix * vpos;
}`;


export {vertexShaderSource};
