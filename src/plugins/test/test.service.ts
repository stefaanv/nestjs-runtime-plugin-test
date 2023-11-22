import { Injectable } from '@nestjs/common'

@Injectable()
export class TestService {
  constructor() {
    console.log('test Service loaded')
  }
}
