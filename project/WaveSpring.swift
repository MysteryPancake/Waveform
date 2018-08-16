//
//  WaveSpring.swift
//  Waveform
//
//  Created by MysteryPancake on 27/11/16.
//  Copyright © 2016 MysteryPancake. All rights reserved.
//

final class WaveSpring {
  
  private let dampening: Float = 0.025
  private let tension: Float = 0.025
  var height, targetHeight: Float
  var velocity: Float = 0
  
  init(height: Float) {
    self.height = height
    self.targetHeight = height
  }
  
  func update() {
    let acceleration: Float = -tension * (height - targetHeight) - (dampening * velocity)
    velocity += acceleration
    height += velocity
  }
}
