import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AppService {
  constructor(private readonly _config: ConfigService) {
    console.log(_config.get('test'))
  }

  getHello(): string {
    return 'Hello World!'
  }
}
