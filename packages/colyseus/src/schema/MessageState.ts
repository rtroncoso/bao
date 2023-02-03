import { Schema, type } from '@colyseus/schema';
import { CharacterState } from './CharacterState';

export enum FontWeightTypes {
  NORMAL = 'normal',
  BOLD = 'bold',
  LIGHT = 'light',
  LIGHTER = 'lighter'
}
export enum FontStyleTypes {
  NORMAL = 'normal',
  OBLIQUE = 'oblique',
  ITALIC = 'italic'
}

export interface MessageOptionsConstructor {
  color?: string;
  fontWeight?: FontWeightTypes;
  fontStyle?: FontStyleTypes;
}

export interface MessageConstructor {
  message: string;
  timestamp: number;
  character?: CharacterState;
  options?: MessageOptions;
}

export class MessageOptions extends Schema {
  @type('string')
  public color = '#fff';

  @type('string')
  public fontWeight: FontWeightTypes = FontWeightTypes.NORMAL;

  @type('string')
  public fontStyle: FontStyleTypes = FontStyleTypes.NORMAL;

  constructor({
    color,
    fontWeight,
    fontStyle
  }: MessageOptionsConstructor = {}) {
    super();
    if (color) this.color = color;
    if (fontWeight) this.fontWeight = fontWeight;
    if (fontStyle) this.fontStyle = fontStyle;
  }
}

export class Message extends Schema {
  @type(CharacterState)
  public character?: CharacterState;

  @type('string')
  public message: string;

  @type('int64')
  public timestamp: number;

  @type(MessageOptions)
  public options = new MessageOptions();

  constructor({ character, message, timestamp, options }: MessageConstructor) {
    super();
    this.message = message;
    this.timestamp = timestamp;
    if (character) this.character = character;
    if (options) this.options = options;
  }
}
