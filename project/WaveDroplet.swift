//
//  WaveDroplet.swift
//  Waveform
//
//  Created by MysteryPancake on 3/12/16.
//  Copyright © 2016 MysteryPancake. All rights reserved.
//

final class WaveDroplet {
  
  private let gravity: Float = 0.003
  var position: (x: Float, y: Float)
  var velocity: (x: Float, y: Float)
  var size: Float
  
  init(x: Float, y: Float, velocityX: Float, velocityY: Float, size: Float) {
    self.position = (x, y)
    self.velocity = (velocityX, velocityY)
    self.size = size
  }
  
  func update() {
    velocity.y -= gravity
    position.x += velocity.x
    position.y += velocity.y
  }
}
