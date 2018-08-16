//
//  GameViewController.swift
//  Waveform
//
//  Created by MysteryPancake on 21/11/16.
//  Copyright © 2016 MysteryPancake. All rights reserved.
//

import GLKit
import OpenGLES

final class GameViewController: GLKViewController {
  
  private var glkView: GLKView!
  
  private let springCount: Int = 30
  private let spread: Float = 0.025
  private let passes: Int = 8
  
  private var springs: [WaveSpring] = []
  private var droplets: [WaveDroplet] = []
  
  private var waveShader: GLuint = 0
  private var dropletShader: GLuint = 0
  
  private var VBO: GLuint = 0
  //private var hdrFBO: GLuint = 0
  //private var colorBuffers: [GLuint] = Array(repeating: 0, count: 2)
  
  override func viewDidLoad() {
    
    super.viewDidLoad()
    
    glkView = self.view as! GLKView
    glkView.context = EAGLContext(api: .openGLES2)!
    glkView.drawableMultisample = .multisample4X
    EAGLContext.setCurrent(glkView.context)
    
    glClearColor(0, 0.1, 0.2, 1)
     
    for _ in 0..<springCount {
      springs.append(WaveSpring(height: 0))
    }
    
    glEnableVertexAttribArray(0)
    glEnableVertexAttribArray(1)
    
    waveShader = prepareShader("Wave", attribs: ["Position", "SourceColor"])
    dropletShader = prepareShader("Droplet", attribs: ["Position", "Size"])
    
    glGenBuffers(1, &VBO)
    glBindBuffer(GLenum(GL_ARRAY_BUFFER), VBO)
    
    let verts = makeVerts()
    glBufferData(GLenum(GL_ARRAY_BUFFER), MemoryLayout<WaveVertex>.size * verts.count, verts, GLenum(GL_DYNAMIC_DRAW))
    
    // TODO: Get bloom to work
    
    /*glGenFramebuffers(1, &hdrFBO)
    glBindFramebuffer(GLenum(GL_FRAMEBUFFER), hdrFBO)
    
    glGenTextures(2, &colorBuffers)
    
    for i in 0...1 {
      glBindTexture(GLenum(GL_TEXTURE_2D), colorBuffers[i])
      glTexImage2D(GLenum(GL_TEXTURE_2D), 0, GL_RGB16F, GLsizei(view.frame.width), GLsizei(view.frame.height), 0, GLenum(GL_RGB), GLenum(GL_FLOAT), nil)
      glTexParameteri(GLenum(GL_TEXTURE_2D), GLenum(GL_TEXTURE_MIN_FILTER), GL_LINEAR)
      glTexParameteri(GLenum(GL_TEXTURE_2D), GLenum(GL_TEXTURE_MAG_FILTER), GL_LINEAR)
      glTexParameteri(GLenum(GL_TEXTURE_2D), GLenum(GL_TEXTURE_WRAP_S), GL_CLAMP_TO_EDGE)
      glTexParameteri(GLenum(GL_TEXTURE_2D), GLenum(GL_TEXTURE_WRAP_T), GL_CLAMP_TO_EDGE)
      glFramebufferTexture2D(GLenum(GL_FRAMEBUFFER), GLenum(GL_COLOR_ATTACHMENT0 + i), GLenum(GL_TEXTURE_2D), colorBuffers[i], 0)
    }

    glDrawBuffers(2, [GLenum(GL_COLOR_ATTACHMENT0), GLenum(GL_COLOR_ATTACHMENT1)])*/
  }
  
  private func makeVerts() -> [WaveVertex] {
    
    var vertices: [WaveVertex] = []
    let scale = 2 / (Float(springCount) - 1)
    
    for (i, spring) in springs.enumerated() {
      let x = Float(i) * scale - 1
      vertices.append(WaveVertex(x: x, y: spring.height, r: 0.5, g: 0.2, b: 0.1))
      vertices.append(WaveVertex(x: x, y: -1, r: 0, g: 0.1, b: 0.2))
    }
    
    return vertices
  }
  
  private func makePoints() -> [DropletVertex] {
    
    var points: [DropletVertex] = []
    for point in droplets {
      points.append(DropletVertex(x: point.position.x, y: point.position.y, size: point.size))
    }
    
    return points
  }
  
  private func BUFFER_OFFSET(_ i: Int) -> UnsafeRawPointer? {
    return UnsafeRawPointer(bitPattern: i)
  }
  
  override func glkView(_ view: GLKView, drawIn rect: CGRect) {
    
    glClear(GLbitfield(GL_COLOR_BUFFER_BIT))
    
    if !droplets.isEmpty {
      glUseProgram(dropletShader)
      glVertexAttribPointer(0, 2, GLenum(GL_FLOAT), GLboolean(GL_FALSE), GLsizei(MemoryLayout<DropletVertex>.size), BUFFER_OFFSET(0))
      glVertexAttribPointer(1, 1, GLenum(GL_FLOAT), GLboolean(GL_FALSE), GLsizei(MemoryLayout<DropletVertex>.size), BUFFER_OFFSET(2 * MemoryLayout<Float>.size))
      let points = makePoints()
      glBufferData(GLenum(GL_ARRAY_BUFFER), MemoryLayout<DropletVertex>.size * points.count, points, GLenum(GL_DYNAMIC_DRAW))
      glDrawArrays(GLenum(GL_POINTS), 0, GLsizei(points.count))
    }
    
    glUseProgram(waveShader)
    glVertexAttribPointer(0, 2, GLenum(GL_FLOAT), GLboolean(GL_FALSE), GLsizei(MemoryLayout<WaveVertex>.size), BUFFER_OFFSET(0))
    glVertexAttribPointer(1, 3, GLenum(GL_FLOAT), GLboolean(GL_FALSE), GLsizei(MemoryLayout<WaveVertex>.size), BUFFER_OFFSET(2 * MemoryLayout<Float>.size))
    let verts = makeVerts()
    //glBufferSubData(GLenum(GL_ARRAY_BUFFER), 0, MemoryLayout<WaveVertex>.size * verts.count, verts)
    glBufferData(GLenum(GL_ARRAY_BUFFER), MemoryLayout<WaveVertex>.size * verts.count, verts, GLenum(GL_DYNAMIC_DRAW))
    glDrawArrays(GLenum(GL_TRIANGLE_STRIP), 0, GLsizei(verts.count))
  }
  
  func update() {
    
    for drop in droplets {
      drop.update()
      if drop.position.x < -1 || drop.position.x > 1 || drop.position.y < -1 {
        droplets = droplets.filter() { $0 !== drop }
      }
    }
    
    for spring in springs {
      spring.update()
    }
    
    var leftDeltas: [Float] = []
    var rightDeltas: [Float] = []
    
    for _ in 0..<passes {
      for i in 0..<springs.count {
        if i > 0 {
          leftDeltas.insert(spread * (springs[i].height - springs[i - 1].height), at: i - 1)
          springs[i - 1].velocity += leftDeltas[i - 1]
        }
        if i < (springs.count - 1) {
          rightDeltas.insert(spread * (springs[i].height - springs[i + 1].height), at: i)
          springs[i + 1].velocity += rightDeltas[i]
        }
      }
      for i in 0..<springs.count {
        if i > 0 {
          springs[i - 1].height += leftDeltas[i - 1]
        }
        if i < (springs.count - 1) {
          springs[i + 1].height += rightDeltas[i]
        }
      }
    }
  }
  
  private func randomFromFloat(_ n: Float) -> Float { // bad
    return Float(arc4random_uniform(UInt32(n * 100))) / 100
  }
  
  private func splash(x: Float, y: Float, speed: Float) { // bad
    let count = speed * 10
    if (count > 2) {
      for _ in 0...Int(count) {
        let newX = x
        let newY = y
        let velX = randomFromFloat(speed / 5) - (speed / 10)
        let velY = randomFromFloat(speed / 10)
        let size = 10 + Float(arc4random_uniform(UInt32(count * 5)))
        droplets.append(WaveDroplet(x: newX, y: newY, velocityX: velX, velocityY: velY, size: size))
      }
    }
  }
  
  private func localCoords(_ point: CGPoint) -> (Float, Float) { // very bad
    let x = Float((2 * point.x) / view.frame.width - 1)
    let y = Float(1 - (2 * point.y) / view.frame.height)
    return (x, y)
  }
  
  override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
    for touch in touches {
      let pos = touch.location(in: self.view)
      let (x, y) = localCoords(pos)
      let nearspring = Int(CGFloat(springs.count) * pos.x / view.frame.width)
      if nearspring >= 0 && nearspring <= springs.count {
        splash(x: x, y: springs[nearspring].height, speed: abs(y))
        springs[nearspring].velocity = y
      }
    }
  }
}
