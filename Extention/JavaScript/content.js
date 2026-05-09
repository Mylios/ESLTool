const assList = "shuttle_right";
const isleListID = "uFixedTableBody";
const sleepDelay = 300;

async function call() {
  let isles = document.getElementsByClassName(isleListID)[0].childNodes;

  let list = new Map();

  for (let i = 1; i < isles.length - 1; i += 2) {
    try {
      isles[i].click();
      let a = await sleep(sleepDelay);
      asses = document.getElementsByClassName(assList)[0].options;
      let arr = []
      for (let j = 0; j < asses.length - 1; j++) {
        arr.append(asses[i].value);
      }
      list.set(isles[i].childNodes[1].childNodes[0].innerHTML, arr);
    } catch (e) {
      i--; //Let's try the isle again.
    }
  }

  console.log(list);

  try {
    await navigator.clipboard.writeText(JSON.stringify(receipts));
    alert("Alle paden zijn gekopieerd.");
  } catch (e) {
    alert("Er is iets mis gegaan. \nOpen opnieuw de extensie, klik op de knop, en klik weer terug in MOMO!")
  }
  return "Works";
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

function check(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        return false;
      }
    }
  }
  return true;
}

document.addEventListener('DOMContentLoaded', call);

window.readLinks = call;