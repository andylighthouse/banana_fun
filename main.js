const fs = require("fs")

function readCsv(filename) {
  return fs.readFileSync(filename, "utf-8")
}

// Turn the file input into an array of strings
const dataArray = readCsv("input1.csv")
  .trim()
  .split("\n")

const obj = {}
// loop though the array and add client id as keys
// the values consist of all the pages for a client
for (let i = 0; i < dataArray.length; i++) {
  if (obj[dataArray[i].split(",")[1].trim()]) {
    obj[dataArray[i].split(",")[1].trim()].push({
      pageNumber: dataArray[i].split(",")[2].trim(),
      time: Number(dataArray[i].split(",")[3].trim()),
    })
  } else {
    obj[dataArray[i].split(",")[1].trim()] = [
      {
        pageNumber: dataArray[i].split(",")[2].trim(),
        time: Number(dataArray[i].split(",")[3].trim()),
      },
    ]
  }
}

// I did this part wrong during the interview.
// Now it keeps the client
// Two reasons I create a new object:
// 1. get rid of the client with less than 3 pages
// 2. also I don't like to modify objects, hard to keep track, I like the idea of
// immutable object and return clones.
const modifiedObj = {}
for (let i = 0; i < Object.values(obj).length; i++) {
  let originalArray = Object.values(obj)[i]
  let objKey = Object.keys(obj)[i]

  // if the length of the array is less than 3 no need to loop and get rid of it
  if (originalArray.length >= 3) {
    modifiedObj[objKey] = []
    for (let i = 0; i < originalArray.length - 2; i++) {
      // make an array of object with a path and time key value pair for each client,
      // example { path: 'P1,P3,P2', time: 1500 }, turn path array into a string
      modifiedObj[objKey].push({
        path: [
          originalArray[i].pageNumber,
          originalArray[i + 1].pageNumber,
          originalArray[i + 2].pageNumber,
        ].join(","),
        time: originalArray[i].time + originalArray[i + 1].time + originalArray[i + 2].time,
      })
    }
  }
}

// Sample modifiedObj at this point:
// { C1:
//   [ { path: 'P1,P3,P2', time: 1500 },
//     { path: 'P3,P2,P1', time: 1400 },
//     { path: 'P2,P1,P3', time: 1600 },
//     { path: 'P1,P3,P2', time: 2100 } ],
//  C2:
//   [ { path: 'P2,P1,P3', time: 2600 },
//     { path: 'P1,P3,P2', time: 1500 },
//     { path: 'P3,P2,P1', time: 1100 },
//     { path: 'P2,P1,P3', time: 700 },
//     { path: 'P1,P3,P2', time: 900 } ] }
//Once the ideal data object has been made, I can answer question 1 and 2

const MostCommonPath = modifiedObj => {
  const countArray = Object.values(modifiedObj).flat()
  // use a hashmap to track path and visited times
  const counterObj = new Map()

  for (let i = 0; i < countArray.length; i++) {
    if (counterObj.has(countArray[i].path)) {
      let temp = counterObj.get(countArray[i].path)
      counterObj.set(countArray[i].path, temp + 1)
    } else {
      counterObj.set(countArray[i].path, 1)
    }
  }

  // my little reduce function to return the key value of the most common path
  const answer = [...counterObj.entries()].reduce((a, e) => (e[1] > a[1] ? e : a))
  return `The most common path is ${answer[0]} which was visited ${answer[1]} times`
}

const slowestPath = modifiedObj => {
  const objKeys = Object.keys(modifiedObj)
  const slowestTime = new Map()
  for (let i = 0; i < objKeys.length; i++) {
    let currentClient = modifiedObj[objKeys[i]]
    for (let j = 0; j < currentClient.length; j++) {
      if (slowestTime.has(objKeys[i])) {
        let temp = slowestTime.get(objKeys[i])
        slowestTime.set(objKeys[i], {
          time: Math.max(temp.time, currentClient[j].time),
          path: currentClient[j].path,
        })
      } else {
        slowestTime.set(objKeys[i], { time: currentClient[j].time, path: currentClient[j].path })
      }
    }
  }
  // again, my little reduce function to return the key value of the slowest time
  const answer = [...slowestTime.entries()].reduce((a, e) => (e[1].time > a[1].time ? e : a))
  return `The slowest time is ${answer[1].time} for path ${answer[1].path} from user ${answer[0]}`
}

console.log(MostCommonPath(modifiedObj))
console.log(slowestPath(modifiedObj))
