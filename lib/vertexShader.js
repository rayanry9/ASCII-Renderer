const gaussVertexShaderSource = `
attribute vec4 a_vertexPosition;
attribute vec2 a_texcoord;

varying vec2 v_texcoord;
void main() {
  gl_Position = a_vertexPosition;
  v_texcoord = a_texcoord;
}`;

export {gaussVertexShaderSource};
