class mazeClass {
    constructor() {
        this.map = [];
        this.fPlayerX = 1.5;
        this.fPlayerY = 1.5;
        this.fPlayerA = Math.PI/2;
        this.height = 50;
        this.width = 50;

    }
};
class cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
};
function mazeGeneration(width, height) {
    var maze = new mazeClass();
    maze.width = width;
    maze.height = height;
    var vis_cells = [];
    var unvis_count = 0;
    for(var i = 0; i < maze.height; i++){
        for(var j = 0; j < maze.width; j++){
            if((i % 2 != 0  && j % 2 != 0) && (i < maze.height-1 && j < maze.width-1)) {
                   maze.map.push('.');
                   unvis_count++;
                   vis_cells.push(false);
            }
            else {
                maze.map.push('#');
                vis_cells.push("");
            }
        }
    }
    var cells_stack = [];
    var cur_cell = new cell(1, 1);
    var neighbors;
    vis_cells[1 * maze.width + 1] = true;
    while (unvis_count > 0) {
        neighbors = getUnvisNeighbors(maze, vis_cells, cur_cell);
        if (neighbors.length > 0) {
            cells_stack.push(cur_cell);
            cur_cell = neighbors[Math.floor(Math.random()*neighbors.length)];
            removeWall(maze, cells_stack[cells_stack.length - 1], cur_cell);
            vis_cells[cur_cell.y * maze.width + cur_cell.x] = true;
            unvis_count--;
        }
        else
        if (cells_stack.length > 0) {
            cur_cell = cells_stack[cells_stack.length - 1];
            cells_stack.pop();
        }
        else {
            //поиск непосещенных вершин?
            unvis_count--;
        }
    }
    createExit(maze);
    return maze;
}

function createExit(maze) {
    //debugger;
    var a = Math.floor(Math.random()*2);
    var exit;
    if (a == 0) {
        var exit = [Math.floor(Math.random()*maze.width), maze.height - 1];
        if (maze.height % 2 == 0) {
            while (maze.map[(exit[1] - 2)*maze.width + exit[0]] != '.') {
                exit = [Math.floor(Math.random()*maze.width), maze.height - 1];
            }
            maze.map[exit[1]*maze.width + exit[0]] = "@";
            maze.map[(exit[1]-1)*maze.width + exit[0]] = "@";
        }
        else {
            while (maze.map[(exit[1] - 1)*maze.width + exit[0]] != '.') {
                exit = [Math.floor(Math.random()*maze.width), maze.height - 1];
            }
            maze.map[exit[1]*maze.width + exit[0]] = "@";
        }
    }
    else {
        var exit = [maze.width - 1, Math.floor(Math.random()*maze.height)];
        if (maze.width % 2 == 0) {
            while (maze.map[exit[1]*maze.width + exit[0] - 2] != '.') {
                exit = [maze.width - 1, Math.floor(Math.random()*maze.height)];
            }
            maze.map[exit[1]*maze.width + exit[0]] = "@";
            maze.map[exit[1]*maze.width + exit[0] - 1] = "@";
        }
        else {
            while (maze.map[exit[1]*maze.width + exit[0] - 1] != '.') {
                exit = [maze.width - 1, Math.floor(Math.random()*maze.height)];
            }
            maze.map[exit[1]*maze.width + exit[0]] = "@";
        }
    }
}

function getUnvisNeighbors(maze, vis_cells, rcell) {
    var x = rcell.x;
    var y = rcell.y;
    var neighborsAr = [];
    if (x-2 >= 0 && vis_cells[y*maze.width + x - 2] === false) {
        neighborsAr.push(new cell(x - 2, y));
    }
    if (x+2 < maze.width && vis_cells[y*maze.width + x + 2] === false) {
        neighborsAr.push(new cell(x + 2, y));
    }
    if (y-2 >= 0 && vis_cells[(y - 2)*maze.width + x] === false) {
        neighborsAr.push(new cell(x, y - 2));
    }
    if (y+2 < maze.height && vis_cells[(y + 2)*maze.width + x] === false) {
        neighborsAr.push(new cell(x, y + 2));
    }
    return neighborsAr;
}

function removeWall(maze, cell1, cell2) {
    if (cell1.x == cell2.x) {
        if (cell1.y + 2 == cell2.y) {
            maze.map[(cell1.y + 1)*maze.width + cell1.x] = ".";
        } 
        if (cell1.y - 2 == cell2.y) {
            maze.map[(cell1.y - 1)*maze.width + cell1.x] = ".";
        }
    }
    if (cell1.y == cell2.y) {
        if (cell1.x + 2 == cell2.x) {
            maze.map[cell1.y*maze.width + cell1.x + 1] = ".";
        } 
        if (cell1.x - 2 == cell2.x) {
            maze.map[cell1.y*maze.width + cell1.x - 1] = ".";
        }
    }
}