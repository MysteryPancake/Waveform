attribute mediump vec4 Position;
attribute lowp float Size;

void main(void) {
  gl_Position = Position;
  gl_PointSize = Size;
}
