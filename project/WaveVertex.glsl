attribute mediump vec4 Position;
attribute lowp vec4 SourceColor;

varying mediump vec4 Height;
varying lowp vec4 DestinationColor;

void main(void) {
  Height = Position / 10.0;
  DestinationColor = SourceColor;
  gl_Position = Position;
}
