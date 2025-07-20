let array = [];
let speed = 250;
let isPaused = false;
let algo = 'Bubble Sort';
const container = document.getElementById('visualizerContainer');
const speedControl = document.getElementById('speedControl');
const userInput = document.getElementById('userInput');
const algoSelector = document.getElementById('algoSelector');

speedControl.oninput = () => speed = +speedControl.value;
algoSelector.onchange = () => algo = algoSelector.value;

function sleep(ms) {
    return new Promise(resolve => {
        let interval = setInterval(() => {
            if (!isPaused) {
                clearInterval(interval);
                resolve();
            }
        }, 10);
    }).then(() => new Promise(res => setTimeout(res, ms)));
}

function renderBars() {
    container.innerHTML = '';
    const maxVal = Math.max(...array);
    array.forEach(v => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${(v / maxVal) * 100}%`;
        bar.innerHTML = `<span>${v}</span>`;
        container.appendChild(bar);
    });
}

function generateRandomArray() {
    array = Array.from({ length: Math.floor(Math.random() * 7) + 4 }, () => Math.floor(Math.random() * 99) + 1);
    userInput.value = array.join(',');
    renderBars();
}

function parseInput() {
    array = userInput.value.split(',').map(Number).slice(0, 10);
    renderBars();
}

// Attach button events
randomBtn.onclick = generateRandomArray;
resetBtn.onclick = parseInput;
pauseBtn.onclick = () => isPaused = true;
playBtn.onclick = async () => {
    isPaused = false;
    const sortFunc = algorithms[algo];
    if (sortFunc) await sortFunc(array);
};

// --- Algorithm Implementations ---
const algorithms = {
    'Bubble Sort': async (arr) => {
        for (let i = 0; i < arr.length - 1; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
                if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                renderBars();
                await sleep(speed);
            }
        }
    },
    'Selection Sort': async (arr) => {
        for (let i = 0; i < arr.length; i++) {
            let minIdx = i;
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[j] < arr[minIdx]) minIdx = j;
                renderBars();
                await sleep(speed);
            }
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            renderBars();
        }
    },
    'Insertion Sort': async (arr) => {
        for (let i = 1; i < arr.length; i++) {
            let key = arr[i];
            let j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
                renderBars();
                await sleep(speed);
            }
            arr[j + 1] = key;
            renderBars();
        }
    },
    'Merge Sort': async (arr) => {
        async function mergeSort(arr, l, r) {
            if (l >= r) return;
            const m = Math.floor((l + r) / 2);
            await mergeSort(arr, l, m);
            await mergeSort(arr, m + 1, r);
            const left = arr.slice(l, m + 1);
            const right = arr.slice(m + 1, r + 1);
            let i = 0, j = 0, k = l;
            while (i < left.length && j < right.length) {
                arr[k++] = left[i] < right[j] ? left[i++] : right[j++];
                renderBars();
                await sleep(speed);
            }
            while (i < left.length) arr[k++] = left[i++];
            while (j < right.length) arr[k++] = right[j++];
            renderBars();
        }
        await mergeSort(arr, 0, arr.length - 1);
    },
    'Quick Sort': async (arr) => {
        async function quickSort(arr, l, r) {
            if (l >= r) return;
            let pivot = arr[r];
            let i = l;
            for (let j = l; j < r; j++) {
                if (arr[j] < pivot) {
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    i++;
                }
                renderBars();
                await sleep(speed);
            }
            [arr[i], arr[r]] = [arr[r], arr[i]];
            renderBars();
            await quickSort(arr, l, i - 1);
            await quickSort(arr, i + 1, r);
        }
        await quickSort(arr, 0, arr.length - 1);
    },
    'Heap Sort': async (arr) => {
        async function heapify(n, i) {
            let largest = i, l = 2 * i + 1, r = 2 * i + 2;
            if (l < n && arr[l] > arr[largest]) largest = l;
            if (r < n && arr[r] > arr[largest]) largest = r;
            if (largest !== i) {
                [arr[i], arr[largest]] = [arr[largest], arr[i]];
                renderBars();
                await sleep(speed);
                await heapify(n, largest);
            }
        }
        for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) await heapify(arr.length, i);
        for (let i = arr.length - 1; i >= 0; i--) {
            [arr[0], arr[i]] = [arr[i], arr[0]];
            renderBars();
            await sleep(speed);
            await heapify(i, 0);
        }
    },
    'Counting Sort': async (arr) => {
        const max = Math.max(...arr);
        const count = Array(max + 1).fill(0);
        arr.forEach(num => count[num]++);
        let idx = 0;
        for (let i = 0; i <= max; i++) {
            while (count[i]-- > 0) {
                arr[idx++] = i;
                renderBars();
                await sleep(speed);
            }
        }
    },
    'Radix Sort': async (arr) => {
        const getMax = arr => Math.max(...arr);
        const countingSort = async (arr, exp) => {
            const output = Array(arr.length).fill(0);
            const count = Array(10).fill(0);
            for (let i = 0; i < arr.length; i++) count[Math.floor(arr[i] / exp) % 10]++;
            for (let i = 1; i < 10; i++) count[i] += count[i - 1];
            for (let i = arr.length - 1; i >= 0; i--) {
                const idx = Math.floor(arr[i] / exp) % 10;
                output[--count[idx]] = arr[i];
            }
            for (let i = 0; i < arr.length; i++) arr[i] = output[i];
            renderBars();
            await sleep(speed);
        }
        for (let exp = 1; Math.floor(getMax(arr) / exp) > 0; exp *= 10)
            await countingSort(arr, exp);
    },
    'Bucket Sort': async (arr) => {
        const n = arr.length;
        const max = Math.max(...arr);
        const buckets = Array.from({ length: n }, () => []);
        for (let i = 0; i < n; i++) {
            const idx = Math.floor((arr[i] / (max + 1)) * n);
            buckets[idx].push(arr[i]);
        }
        arr.length = 0;
        for (const bucket of buckets) {
            bucket.sort((a, b) => a - b);
            for (const val of bucket) {
                arr.push(val);
                renderBars();
                await sleep(speed);
            }
        }
    }
};