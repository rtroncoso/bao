export default class MapComponent {
  constructor() {
    this.layers = [[[]]];
    this.tiles = [];

    this.objects = [];
    this.triggers = [];
    this.collisions = [];
    this.number = 0;
    this.tmx = {};
  }
}
