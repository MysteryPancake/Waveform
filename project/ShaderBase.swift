//
//  ShaderBase.swift
//  Waveform
//
//  Created by MysteryPancake on 24/11/16.
//  Copyright © 2016 MysteryPancake. All rights reserved.
//

import GLKit

private func compile(_ shaderName: String, shaderType: GLenum) -> GLuint {
  
  let shaderPath = Bundle.main.path(forResource: shaderName, ofType: "glsl")!
  let shaderString = try! NSString(contentsOfFile: shaderPath, encoding: String.Encoding.utf8.rawValue)
  
  let shaderHandle: GLuint = glCreateShader(shaderType)
  if shaderHandle == 0 {
    print("Couldn't create shader!")
  }
  
  var shaderStringLength = GLint(shaderString.length)
  var shaderStringUTF8 = shaderString.utf8String
  glShaderSource(shaderHandle, 1, &shaderStringUTF8, &shaderStringLength)
  
  glCompileShader(shaderHandle)
  var compileStatus: GLint = 0
  glGetShaderiv(shaderHandle, GLenum(GL_COMPILE_STATUS), &compileStatus)
  if compileStatus == GL_FALSE {
    var info: [GLchar] = Array(repeating: 0, count: 1024)
    var actualLength: GLsizei = 0
    glGetShaderInfoLog(shaderHandle, 1024, &actualLength, &info)
    print(String(utf8String: info)!)
  }
  
  return shaderHandle
}

func prepareShader(_ shaderName: String, attribs: [String]) -> GLuint {
    
  let vertexShader = compile(shaderName + "Vertex", shaderType: GLenum(GL_VERTEX_SHADER))
  let fragmentShader = compile(shaderName + "Fragment", shaderType: GLenum(GL_FRAGMENT_SHADER))

  let programHandle = glCreateProgram()
  glAttachShader(programHandle, vertexShader)
  glAttachShader(programHandle, fragmentShader)

  for (i, name) in attribs.enumerated() {
    glBindAttribLocation(programHandle, GLuint(i), name)
  }
  
  glLinkProgram(programHandle)
  var linkStatus: GLint = 0
  glGetProgramiv(programHandle, GLenum(GL_LINK_STATUS), &linkStatus)
  if linkStatus == GL_FALSE {
    var info: [GLchar] = Array(repeating: 0, count: 1024)
    var actualLength: GLsizei = 0
    glGetShaderInfoLog(programHandle, 1024, &actualLength, &info)
    print(String(utf8String: info)!)
  }
  
  return programHandle
}
