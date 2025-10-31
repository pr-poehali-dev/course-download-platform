#!/usr/bin/env node
/**
 * Fetch and analyze Yandex Disk folders at offset 400 to find VARCHAR violations.
 * Run this script: node find_problem_folder.js
 */

const https = require('https');
const fs = require('fs');

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

console.log('Fetching data from Yandex Disk API at offset 400...');
console.log('='.repeat(80));

https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            
            // Save raw response
            fs.writeFileSync('offset_400_raw.json', JSON.stringify(response, null, 2));
            console.log('✓ Raw data saved to offset_400_raw.json\n');
            
            if (!response._embedded || !response._embedded.items) {
                console.log('ERROR: No items found in API response');
                return;
            }
            
            const items = response._embedded.items;
            console.log(`Found ${items.length} items\n`);
            
            const TITLE_LIMIT = 1000;
            const WORK_TYPE_LIMIT = 100;
            const SUBJECT_LIMIT = 200;
            
            const violations = [];
            const allItems = [];
            
            items.forEach((item, i) => {
                if (item.type === 'dir') {
                    const folderName = item.name || '';
                    const workInfo = extractWorkInfo(folderName);
                    
                    const title = workInfo.title;
                    const workType = workInfo.work_type;
                    const subject = determineSubject(title);
                    
                    const itemData = {
                        offset_index: 400 + i,
                        folder_name: folderName,
                        title: title,
                        title_length: title.length,
                        work_type: workType,
                        work_type_length: workType.length,
                        subject: subject,
                        subject_length: subject.length,
                        violations: []
                    };
                    
                    if (title.length > TITLE_LIMIT) {
                        itemData.violations.push({
                            field: 'title',
                            length: title.length,
                            limit: TITLE_LIMIT,
                            exceeds_by: title.length - TITLE_LIMIT
                        });
                        violations.push(itemData);
                    }
                    
                    if (workType.length > WORK_TYPE_LIMIT) {
                        itemData.violations.push({
                            field: 'work_type',
                            length: workType.length,
                            limit: WORK_TYPE_LIMIT,
                            exceeds_by: workType.length - WORK_TYPE_LIMIT
                        });
                        if (!violations.includes(itemData)) {
                            violations.push(itemData);
                        }
                    }
                    
                    if (subject.length > SUBJECT_LIMIT) {
                        itemData.violations.push({
                            field: 'subject',
                            length: subject.length,
                            limit: SUBJECT_LIMIT,
                            exceeds_by: subject.length - SUBJECT_LIMIT
                        });
                        if (!violations.includes(itemData)) {
                            violations.push(itemData);
                        }
                    }
                    
                    allItems.push(itemData);
                }
            });
            
            // Save analysis
            const analysis = {
                total_items: allItems.length,
                violations_count: violations.length,
                violations: violations,
                all_items: allItems
            };
            
            fs.writeFileSync('offset_400_analysis.json', JSON.stringify(analysis, null, 2));
            console.log('✓ Analysis saved to offset_400_analysis.json\n');
            
            // Print summary
            if (violations.length > 0) {
                console.log('='.repeat(80));
                console.log(`FOUND ${violations.length} VIOLATION(S)!`);
                console.log('='.repeat(80));
                
                violations.forEach(item => {
                    console.log('\n' + '='.repeat(80));
                    console.log(`Offset Index: ${item.offset_index}`);
                    console.log('='.repeat(80));
                    console.log(`Folder Name: ${item.folder_name}`);
                    console.log(`\nExtracted Fields:`);
                    console.log(`  Title (${item.title_length} chars): ${item.title.substring(0, 100)}...`);
                    console.log(`  Work Type (${item.work_type_length} chars): ${item.work_type.substring(0, 100)}...`);
                    console.log(`  Subject (${item.subject_length} chars): ${item.subject}`);
                    console.log(`\nViolations:`);
                    item.violations.forEach(v => {
                        console.log(`  ❌ ${v.field.toUpperCase()}: ${v.length} chars (limit: ${v.limit}, exceeds by ${v.exceeds_by})`);
                    });
                });
            } else {
                console.log('='.repeat(80));
                console.log('No violations found!');
                console.log('='.repeat(80));
                console.log('\nShowing top 10 longest titles:');
                allItems.sort((a, b) => b.title_length - a.title_length).slice(0, 10).forEach((item, i) => {
                    console.log(`  ${i+1}. Offset ${item.offset_index}: ${item.title_length} chars`);
                    console.log(`     ${item.title.substring(0, 80)}...`);
                });
                
                console.log('\nShowing top 10 longest work types:');
                allItems.sort((a, b) => b.work_type_length - a.work_type_length).slice(0, 10).forEach((item, i) => {
                    console.log(`  ${i+1}. Offset ${item.offset_index}: ${item.work_type_length} chars`);
                    console.log(`     ${item.work_type.substring(0, 80)}...`);
                });
            }
            
            console.log('\n' + '='.repeat(80));
            console.log('Analysis complete!');
            console.log('='.repeat(80));
            
        } catch (error) {
            console.error('Error parsing response:', error);
            console.error('Raw response:', data.substring(0, 500));
        }
    });
}).on('error', (error) => {
    console.error('Error fetching data:', error);
});
