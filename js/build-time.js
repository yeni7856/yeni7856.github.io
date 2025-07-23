// const fs = require('fs');
// const path = require('path');

// // const now = new Date().toLocaleString('ko-KR', {
// //   timeZone: 'Asia/Seoul',
// //   year: 'numeric',
// //   month: '2-digit',
// //   day: '2-digit',
// //   hour: '2-digit',
// //   minute: '2-digit',
// // });
// // const now = new Date().toISOString();
// const output = { lastBuild: now };
// fs.writeFileSync(path.join(__dirname, 'build-time.json'), JSON.stringify(output, null, 2));

// console.log(`✅ [build-time.json] 생성 완료: ${now}`);

const fs = require('fs');
const path = require('path');

const now = new Date();

const koreaTime = new Date(
  now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' })
);

// ISO 형식 말고, 한국 시간으로 포맷해서 저장
const formatted = koreaTime.toISOString(); // 또는 그냥 koreaTime.toLocaleString()도 가능

const output = { lastBuild: formatted };
fs.writeFileSync(path.join(__dirname, 'build-time.json'), JSON.stringify(output, null, 2));

console.log(`✅ [build-time.json] 생성 완료: ${formatted}`);