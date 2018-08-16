varying mediump vec4 Height;
varying lowp vec4 DestinationColor;

void main(void) {
  lowp vec4 Color = DestinationColor;
  if (DestinationColor.r > (0.5 - Height.y))
  Color = mix(vec4(1, 0.5, 0.2, 1), DestinationColor, (0.5 - DestinationColor.r) / Height.y);
  gl_FragColor = Color;
}
