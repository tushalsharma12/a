const array = [1,13,5,0,8];


function findMax(array) {
    let max = array[0];
    for (let index = 1; index < array.length; index++) {
        if (array[index] > max) {
            max = array[index];
        }
    }
    return console.log(max);
}

findMax(array);

function findMin(array) {
    let min = array[0];
    for (let index = 1; index < array.length; index++) {
        if (array[index] < min) {
            min = array[index];
        }
    }
    return console.log(min);
}

findMin(array);
