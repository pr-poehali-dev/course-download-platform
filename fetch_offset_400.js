// Script to fetch and analyze Yandex Disk data at offset 400
const https = require('https');

function extractWorkInfo(folderName) {
    const match = folderName.trim().match(/^(.+?)\s*\((.+?)\)\s*$/);
    if (match) {
        return {
            title: match[1].trim(),
            work_type: match[2].trim()
        };
    }
    return {
        title: folderName,
        work_type: 'неизвестный тип'
    };
}

function determineSubject(title) {
    const t = title.toLowerCase();
    
    if (/электро|электри|энергет|эу|ру/.test(t)) return 'электроэнергетика';
    if (/автоматиз|управлен|асу|контрол|регулир/.test(t)) return 'автоматизация';
    if (/строител|бетон|конструк|здание|сооружен/.test(t)) return 'строительство';
    if (/механ|привод|станок|оборудован/.test(t)) return 'механика';
    if (/газ|газопровод|нефт/.test(t)) return 'газоснабжение';
    if (/програм|по|software|алгоритм|дискрет/.test(t)) return 'программирование';
    if (/безопасн|охран|труд|защит/.test(t)) return 'безопасность';
    if (/тепло|водоснабжен|вентиляц|отоплен/.test(t)) return 'теплоснабжение';
    if (/транспорт|дорог|судов|автомобил|локомотив/.test(t)) return 'транспорт';
    if (/гидравлик|гидро/.test(t)) return 'гидравлика';
    
    return 'общая инженерия';
}

const publicKey = encodeURIComponent('https://disk.yandex.ru/d/usjmeUqnkY9IfQ');
const url = `https://cloud-api.yandex.net/v1/disk/public/resources?public_key=${publicKey}&limit=100&offset=400`;

console.log('Fetching data from Yandex Disk API at offset 400...\n');

https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            
            if (response._embedded && response._embedded.items) {
                const items = response._embedded.items;
                console.log(`Found ${items.length} items at offset 400\n`);
                
                const TITLE_LIMIT = 1000;
                const WORK_TYPE_LIMIT = 100;
                const SUBJECT_LIMIT = 200;
                
                const violations = [];
                
                items.forEach((item, i) => {
                    if (item.type === 'dir') {
                        const folderName = item.name || '';
                        const workInfo = extractWorkInfo(folderName);
                        
                        const title = workInfo.title;
                        const workType = workInfo.work_type;
                        const subject = determineSubject(title);
                        
                        const titleLen = title.length;
                        const workTypeLen = workType.length;
                        const subjectLen = subject.length;
                        
                        const offsetIndex = 400 + i;
                        
                        console.log(`Item ${i} (offset ${offsetIndex}):`);
                        console.log(`  Folder: ${folderName.substring(0, 100)}${folderName.length > 100 ? '...' : ''}`);
                        console.log(`  Title length: ${titleLen} / ${TITLE_LIMIT}`);
                        console.log(`  Work type length: ${workTypeLen} / ${WORK_TYPE_LIMIT}`);
                        console.log(`  Subject length: ${subjectLen} / ${SUBJECT_LIMIT}`);
                        
                        const itemViolations = [];
                        
                        if (titleLen > TITLE_LIMIT) {
                            itemViolations.push({
                                field: 'title',
                                length: titleLen,
                                limit: TITLE_LIMIT,
                                value: title
                            });
                            console.log(`  *** VIOLATION: Title exceeds limit by ${titleLen - TITLE_LIMIT} characters! ***`);
                        }
                        
                        if (workTypeLen > WORK_TYPE_LIMIT) {
                            itemViolations.push({
                                field: 'work_type',
                                length: workTypeLen,
                                limit: WORK_TYPE_LIMIT,
                                value: workType
                            });
                            console.log(`  *** VIOLATION: Work type exceeds limit by ${workTypeLen - WORK_TYPE_LIMIT} characters! ***`);
                        }
                        
                        if (subjectLen > SUBJECT_LIMIT) {
                            itemViolations.push({
                                field: 'subject',
                                length: subjectLen,
                                limit: SUBJECT_LIMIT,
                                value: subject
                            });
                            console.log(`  *** VIOLATION: Subject exceeds limit by ${subjectLen - SUBJECT_LIMIT} characters! ***`);
                        }
                        
                        if (itemViolations.length > 0) {
                            violations.push({
                                offsetIndex,
                                folderName,
                                title,
                                workType,
                                subject,
                                violations: itemViolations
                            });
                        }
                        
                        console.log();
                    }
                });
                
                if (violations.length > 0) {
                    console.log('\n' + '='.repeat(80));
                    console.log(`FOUND ${violations.length} VIOLATION(S):`);
                    console.log('='.repeat(80));
                    
                    violations.forEach(v => {
                        console.log(`\nOffset: ${v.offsetIndex}`);
                        console.log(`Folder: ${v.folderName}`);
                        console.log(`Title: ${v.title}`);
                        console.log(`Work Type: ${v.workType}`);
                        console.log(`Subject: ${v.subject}`);
                        console.log('\nField violations:');
                        v.violations.forEach(violation => {
                            console.log(`  - ${violation.field}: ${violation.length} chars (limit: ${violation.limit}, exceeds by ${violation.length - violation.limit})`);
                            console.log(`    Value: ${violation.value.substring(0, 200)}${violation.value.length > 200 ? '...' : ''}`);
                        });
                        console.log('-'.repeat(80));
                    });
                } else {
                    console.log('\nNo field length violations found in this batch.');
                }
            } else {
                console.log('No items found in response');
            }
        } catch (error) {
            console.error('Error parsing response:', error);
            console.error('Raw response:', data.substring(0, 500));
        }
    });
}).on('error', (error) => {
    console.error('Error fetching data:', error);
});
