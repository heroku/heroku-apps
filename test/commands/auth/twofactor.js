'use strict'
/* globals commands, describe it */

const expect = require('unexpected')

describe('twofactor alias', () => {
  it('auth:twofactor is found', () => {
    const cmd = commands.find(c => c.topic === 'auth' && c.command === 'twofactor')
    expect(cmd, 'to have own properties', {
      topic: 'auth',
      command: 'twofactor'
    })
  })

  it('twofactor is found', () => {
    const cmd = commands.find(c => c.topic === 'twofactor' && !c.command)
    expect(cmd, 'to have own properties', {
      topic: 'twofactor'
    })
    expect(cmd, 'not to have own properties', ['command'])
  })

  it('auth:twofactor:disable is found', () => {
    const cmd = commands.find(c => c.topic === 'auth' && c.command === 'twofactor:disable')
    expect(cmd, 'to have own properties', {
      topic: 'auth',
      command: 'twofactor:disable'
    })
  })

  it('twofactor:disable is found', () => {
    const cmd = commands.find(c => c.topic === 'twofactor' && c.command === 'disable')
    expect(cmd, 'to have own properties', {
      topic: 'twofactor',
      command: 'disable'
    })
  })

  it('auth:twofactor:generate is found', () => {
    const cmd = commands.find(c => c.topic === 'auth' && c.command === 'twofactor:generate')
    expect(cmd, 'to have own properties', {
      topic: 'auth',
      command: 'twofactor:generate'
    })
  })

  it('twofactor:generate is found', () => {
    const cmd = commands.find(c => c.topic === 'twofactor' && c.command === 'generate')
    expect(cmd, 'to have own properties', {
      topic: 'twofactor',
      command: 'generate'
    })
  })
})
