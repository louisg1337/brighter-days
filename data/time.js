export let timeArray = []
let hour = 12
let tag = "AM"
for (var i = 0; i <= 1440; i++) {
  let time = i % 60
  time.toString()
  if (i % 60 === 0 && i !== 0) {
   	hour = hour + 1
  }
  if (hour === 13) {
   hour = 1
  }
  if (time < 10) {
    time = '0'+ time
  }
  if (i === 720) {
   tag = "PM"
  }
  let finalTime = hour.toString()+ ":" + time + " "+ tag
  let value = i
  let temp = {
  	time: finalTime,
    value: value
  }  
  timeArray = [...timeArray, temp]
}

export let hours = []
for (let i = 1; i <= 12; i++){
    let temp = {
        time: i.toString(),
        value: i
    }
    hours = [...hours, temp]
}

export let minutes = []
for (let i = 0; i <= 59; i++){
    let time = i.toString()
    if (i < 10){
        time = "0" + time
    }
    let temp = {
        time,
        value: i
    }
    minutes = [...minutes, temp]
}

export let timeOfDay = [
    {
        label: "AM",
        value: true
    },
    {
        label: "PM",
        value: false
    }
]
