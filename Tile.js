class Tile {
  constructor(row, col, img) {
    this.row = row;
    this.col = col;
    this.img = img;
    this.group = -1;
    this.inGroup = false;     // is this tile in a group.  Needed for group assignment
    this.isMoved = false;     // is this tile moved to another location
    this.isReplaced = false;  // is this tile replaced by another tile during a move
    this.isEmpty = false;     // is this tile empty after the move (and before the replacement)
    this.isDisplaced = false; // is this tile replaced but was not moving
  }

}