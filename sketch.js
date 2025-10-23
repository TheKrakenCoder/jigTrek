let m_images = [];
let m_tiles;  // a 2D array to hold our tiles
let m_rows = 3;
let m_cols = 3;
let m_w, m_h;
let m_selectedGroup = -1;
let m_mouseX, m_mouseY;
let m_debug = false;
let m_slider;
let m_numTries = 1;

function preloadOrig() {
  // m_image = loadImage("image (12).jpg");
  for (let i = 1; i <= 1000; i++) {
    let str = "images/image ("+i+").jpg";
    // console.log(str);
    m_images.push(loadImage(str));
    // images.push(loadImage("data_xmas_small/image (1).jpg"));
  }
}
function preload() {
  // m_image = loadImage("image (12).jpg");
  for (let i = 93; i <= 200; i++) {
    let str = "imagesTrek/image ("+i+").jpg";
    // console.log(str);
    m_images.push(loadImage(str));
    // images.push(loadImage("data_xmas_small/image (1).jpg"));
  }
}

function setup() {
  createCanvas(640, 480);

  for (let i = 0; i < m_images.length; i++) m_images[i].resize(width, height);

  let button = createButton("New Image");
  button.mousePressed(function() { resetData(); } );

  createP("Size ");

  m_slider = createSlider(2, 10, 4, 1);

  resetData();
}

function resetData() {
  m_cols = m_slider.value();
  m_rows = m_cols;
  m_numTries = m_cols;

  m_w = width / m_cols;
  m_h = height / m_rows;

  let selectedImage = random(m_images);

  m_tiles = new Array(m_rows).fill(0).map(() => new Array(m_cols).fill(0));

  for (let i = 0; i < m_rows; i++) {
    // m_tiles[i] = [];
    for (let j = 0; j < m_cols; j++) {
      // let idx = i * m_cols + j;
      let img = createImage(m_w, m_h);
      let tile = new Tile(i, j, img);
      // m_tiles[i].push(tile);
      m_tiles[i][j] = tile;
      let srcX = j * m_w;
      let srcY = i * m_h;
      m_tiles[i][j].img.copy(selectedImage, srcX, srcY, m_w, m_h, 0, 0, m_w, m_h);
    }
  }

  shuffle2DArray(m_tiles, m_rows, m_cols);

}

function shuffle2DArray(arr, rows, cols) {
  for (let i = 0; i < 1000; i++) {
    let row = floor(random(rows));
    let col = floor(random(cols));
    let row1 = floor(random(rows));
    let col1 = floor(random(cols));
    let temp = arr[row][col];
    arr[row][col] = arr[row1][col1];
    arr[row1][col1] = temp;
  }
}

function determineGroups() {
  for (let i = 0; i < m_rows; i++) {
    for (let j = 0; j < m_cols; j++) {
      let idx = i * m_cols + j;
      m_tiles[i][j].group = idx;
      m_tiles[i][j].inGroup = false;
      // m_tiles[i][j].group = -1;
    }
  }

  // Performing this check multiple times allows us to keep moving left
  // and correcting incorerct group numbers.  In the following example, the
  // first 2 in the second row does not get correctly labeled, since the 2
  // to its right has not yet been assigned properly.
  // x y z 2
  // a 2 2 2

  for (let t = 0; t < m_numTries; t++) {

    for (let i = 0; i < m_rows; i++) {
      for (let j = 0; j < m_cols; j++) {
        let row = m_tiles[i][j].row;
        let col = m_tiles[i][j].col;
        let group = m_tiles[i][j].group;
        // check to the right.  Need the same row and the column to the right.
        // Also its possible the tile to the right is already in a group with the
        // tile above it, so I need to change my group to its group
        if (j < m_cols-1) {
          if (row == m_tiles[i][j+1].row && col+1 == m_tiles[i][j+1].col) {
            if (m_tiles[i][j+1].inGroup) {
              m_tiles[i][j].group = m_tiles[i][j+1].group;
              m_tiles[i][j].inGroup = true;
            } else {
              m_tiles[i][j+1].group = group;
              m_tiles[i][j+1].inGroup = true;
            }
          }
        }

        // check below.  We don't have to worry about him already being in a group
        // because we are checkling left to right first, then top to bottom.
        if (i < m_rows-1) {
          if (row+1 == m_tiles[i+1][j].row && col == m_tiles[i+1][j].col) {
            m_tiles[i+1][j].group = group;
            m_tiles[i+1][j].inGroup = true;
          }
        }
      }
    }

  }

}

function mousePressed() {
  // determine which tile/collection is clicked (the selectedCollection).
  // store the x,y location of original click
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    return;
  }

  let col = floor(mouseX / m_w);
  let row = floor(mouseY / m_h);
  m_selectedGroup = m_tiles[row][col].group;
  console.log('mousePressed m_selectedGroup = ' , m_selectedGroup);
  m_mouseX = mouseX;
  m_mouseY = mouseY;
  
  for (let i = 0; i < m_rows; i++) {
    for (let j = 0; j < m_cols; j++) {
      m_tiles[i][j].isMoved = false;
      m_tiles[i][j].isReplaced = false;
      m_tiles[i][j].isEmpty = false;
      m_tiles[i][j].isDisplaced = false;
    }
  }

}

function markTiles(deltaCol, deltaRow) {
  // determine which tiles are moving and which are being replaced
  for (let i = 0; i < m_rows; i++) {
    for (let j = 0; j < m_cols; j++) {
      if (m_tiles[i][j].group == m_selectedGroup) {
        m_tiles[i][j].isMoved = true;
        m_tiles[i+deltaRow][j+deltaCol].isReplaced = true;
      }
    }
  }

  // determine which tiles are going to be empty and which are going to be displaced
  for (let i = 0; i < m_rows; i++) {
    for (let j = 0; j < m_cols; j++) {
      if (m_tiles[i][j].isMoved && !m_tiles[i][j].isReplaced) {
        m_tiles[i][j].isEmpty = true;
      }
      if (!m_tiles[i][j].isMoved && m_tiles[i][j].isReplaced) {
        m_tiles[i][j].isDisplaced = true;
      }
    }
  }

}

function mouseReleased() {

  // determine tile offset in rows and columns
  let deltaX = mouseX - m_mouseX;
  let deltaY = mouseY - m_mouseY;
  let deltaCol = round(deltaX / m_w);
  let deltaRow = round(deltaY / m_h);
  console.log('deltaCol, deltaRow = ' , deltaCol, deltaRow);

  if (isNaN(deltaCol) || isNaN(deltaRow)) {
    m_selectedGroup = -1;
    console.log("Error.  Press outside game board");
    return;
  }

  if (deltaCol == 0 && deltaRow == 0) {
    m_selectedGroup = -1;
    console.log("No move")
    return;
  }
  // make sure that no tiles will be moved outside the game board.
  if (!isValidMove(deltaCol, deltaRow, m_selectedGroup)) {
    m_selectedGroup = -1;
    console.log("Error. Trying to move outsude gamne board")
    return;
  }

  let newTiles = new Array(m_rows).fill(0).map(() => new Array(m_cols).fill(0));

  markTiles(deltaCol, deltaRow);

  // m_selectedGroup = -1;
  // return;

  // Copy the moved tiles to newTiles
  for (let i = 0; i < m_rows; i++) {
    for (let j = 0; j < m_cols; j++) {
      if (m_tiles[i][j].isMoved) {
        newTiles[i + deltaRow][j + deltaCol] = m_tiles[i][j];
        console.log("moving_1 " + i, j + " to " + (i+deltaRow), (j+deltaCol));
      } 
    }
  }

  // Copy the replaced tiles to newTiles
  for (let i = 0; i < m_rows; i++) {
    for (let j = 0; j < m_cols; j++) {
      // if (m_tiles[i][j].isReplaced && !m_tiles[i][j].isDisplaced) {
      if (m_tiles[i][j].isReplaced && !m_tiles[i][j].isMoved && !m_tiles[i][j].isDisplaced) {
        newTiles[i-deltaRow][j-deltaCol] = m_tiles[i][j];
        console.log("moving_2 " + i, j + " to " + (i-deltaRow), (j-deltaCol));
      } 
    }
  }

  // Copy any displaced tiles into an empty spot, assuming that
  // it can be moved directly opposite of the original move.  We have to
  // mark the empty spot an non-empty so we don't use it in the next loop and
  // also mark the displaced spot as non-displaced
  for (let i = 0; i < m_rows; i++) {
    for (let j = 0; j < m_cols; j++) {
      if (m_tiles[i][j].isDisplaced) {
        if (m_tiles[i-deltaRow][j-deltaCol].isEmpty) {
          newTiles[i-deltaRow][j-deltaCol] = m_tiles[i][j];
          console.log("moving_3 " + i, j + " to " + (i-deltaRow), (j-deltaCol));
          m_tiles[i-deltaRow][j-deltaCol].isEmpty = false;
          m_tiles[i][j].isDisplaced = false;
        }
      } 
    }
  }

  // Copy any remaining displaced tiles into any empty spot
  for (let i = 0; i < m_rows; i++) {
    for (let j = 0; j < m_cols; j++) {
      if (m_tiles[i][j].isDisplaced) {
        // find any empty spot
        let lfound = false;
        for (let k = 0; k < m_rows; k++) {
          for (let l = 0; l < m_cols; l++) {
            if (m_tiles[k][l].isEmpty && !lfound) {
              newTiles[k][l] = m_tiles[i][j];
              console.log("moving_4 " + i, j + " to " + (k), (l));
              m_tiles[k][l].isEmpty = false;
              lfound = true;
            }
          }
        }
      } 
    }
  }

  // Copy any remaining tiles to newTiles
  for (let i = 0; i < m_rows; i++) {
    for (let j = 0; j < m_cols; j++) {
      if (newTiles[i][j] == 0) {
        newTiles[i][j] = m_tiles[i][j];
      } 
    }
  }

  m_tiles = newTiles;

  m_selectedGroup = -1;
  // for (let i = 0; i < m_rows; i++) {
  //   for (let j = 0; j < m_cols; j++) {
  //     m_tiles.isMoved = false;
  //     m_tiles.isReplaced = false;
  //     m_tiles.isEmpty = false;
  //     m_tiles.isDisplaced = false;
  //   }
  // }

  console.log('-------------------------------');
}

function isValidMove(deltaCol, deltaRow, selectedGroup) {
  for (let i = 0; i < m_rows; i++) {
    for (let j = 0; j < m_cols; j++) {
      if (m_tiles[i][j].group == selectedGroup) {
        if (i + deltaRow < 0 || i + deltaRow >= m_rows) return false;
        if (j + deltaCol < 0 || j + deltaCol >= m_cols) return false;
      }
    }
  }
  return true;
}

function draw() {
  // image(m_image,0, 0);
  background(51);

  // determine collection numbers of each tile
  determineGroups();

  // check for winning.  Every tile's row,col matches the indexes in the nested loop

  // draw each tile.  Moving tiles are drawn at the offset location.
  // Draw unmoving tiles first, then draw moving so they appear on top.

  //////////////////
  // Draw Unmoving tiles
  stroke(255, 0, 0);
  strokeWeight(2);
  textSize(20);
  let winner = true;
  for (let i = 0; i < m_rows; i++) {
    for (let j = 0; j < m_cols; j++) {
      if (m_selectedGroup == m_tiles[i][j].group) continue;

      let x = j * m_w;
      let y = i * m_h;

      image(m_tiles[i][j].img, x, y, m_w, m_h);
      if (m_debug) text(m_tiles[i][j].group, x+m_w/2, y+m_h/2);
      if (m_debug) text(m_tiles[i][j].col + " " + m_tiles[i][j].row, x+m_w/2, y+m_h/2+20);
      let t = m_tiles[i][j];
      if (m_debug) text("M:" + +t.isMoved + " R:" + +t.isReplaced + " E:" + +t.isEmpty + " D:" + +t.isDisplaced, x, y+m_h/2+40)

      // check the tile to the right and the tile below and draw a line
      // in between if they are not in the same group
      if (j < m_cols-1) {
        if (m_tiles[i][j].group != m_tiles[i][j+1].group) {
          line((j+1)*m_w, i*m_h, (j+1)*m_w, (i+1)*m_h);
          winner = false;
        }
      }
      if (i < m_rows-1) {
        if (m_tiles[i][j].group != m_tiles[i+1][j].group) {
          line(j*m_w, (i+1)*m_h, (j+1)*m_w, (i+1)*m_h);
          winner = false;
        }
      }
    }
  }

  //////////////////
  // Draw Moving tiles
  for (let i = 0; i < m_rows; i++) {
    for (let j = 0; j < m_cols; j++) {
      if (m_selectedGroup != m_tiles[i][j].group) continue;
      
      let x = j * m_w;
      let y = i * m_h;
      x += (mouseX - m_mouseX);
      y += (mouseY - m_mouseY);

      image(m_tiles[i][j].img, x, y, m_w, m_h);
      if (m_debug) text(m_tiles[i][j].group, x+m_w/2, y+m_h/2);
      if (m_debug) text(m_tiles[i][j].col + " " + m_tiles[i][j].row, x+m_w/2, y+m_h/2+20);

    }
  }

  // Check for Winner
  if (winner) {
    stroke(0, 255, 0);
    strokeWeight(20);
    noFill();
    rect(0, 0, width, height);
  }

  // Debug check for correctness
  for (let i = 0; i < m_rows; i++) {
    for (let j = 0; j < m_cols; j++) {
      let tile1 = m_tiles[i][j];
      for (let k = 0; k < m_rows; k++) {
        for (let l = 0; l < m_cols; l++) {
          if (i != k || j != l) {
            let tile2 = m_tiles[k][l];
            if (tile1.row == tile2.row && tile1.col == tile2.col) {
              let x = j * m_w;
              let y = i * m_h;
              line(x, y, x+m_w, y+m_h);
            }
          }
        }
      }
    }
  }

}
