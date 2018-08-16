void main(void) {
  lowp vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
  if (dot(circCoord, circCoord) > 1.0) discard;
  const lowp vec3 lightDir = normalize(vec3(0, -1, -0.5));
  const lowp vec3 ambient = vec3(0.5, 0.2, 0.1);
  const lowp vec3 lightDiffuse = vec3(1, 0.5, 0.2);
  lowp vec3 normal = vec3(circCoord, sqrt(1.0 - dot(circCoord, circCoord)));
  lowp float c = max(dot(normal, lightDir), 0.0);
  gl_FragColor = vec4(ambient + lightDiffuse * c, 1);
}
