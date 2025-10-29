// Node.js script to generate complete SQL for all 486 works
// Run with: node generate_all_sql.js

const https = require('https');
const fs = require('fs');

const API_BASE = "cloud-api.yandex.net";
const PUBLIC_KEY = "https://disk.yandex.ru/d/usjmeUqnkY9IfQ";
const BASE_URL = "https://yadi.sk/d/usjmeUqnkY9IfQ";

function extractWorkInfo(folderName) {
    const match = folderName.trim().match(/^(.+?)\s*\((.+?)\)\s*$/);
    if (match) {
        return {
            title: match[1].trim(),
            workType: match[2].trim()
        };
    }
    return {
        title: folderName,
        workType: "неизвестный тип"
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
    if (/тепло|водоснабжен|вентиляц|отоплен|канализац/.test(t)) return 'теплоснабжение';
    if (/транспорт|дорог|судов|автомобил|локомотив/.test(t)) return 'транспорт';
    if (/гидравлик|гидро/.test(t)) return 'гидравлика';
    
    return 'общая инженерия';
}

function determinePrice(workType, title) {
    const wt = workType.toLowerCase();
    const t = title.toLowerCase();
    
    if (/практическая|практика/.test(wt) && !/отчет/.test(wt)) return 1000;
    if (/отчет.*практ/.test(wt)) return 1500;
    if (/курсовая|курсовой/.test(wt)) {
        if (/проектирование|расчет|модернизация|разработка/.test(t)) return 2200;
        return 1800;
    }
    if (/дипломная|диплом/.test(wt)) {
        if (/модернизация|проектирование системы|разработка|автоматизация/.test(t)) return 6000;
        return 5000;
    }
    if (/реферат/.test(wt)) return 1200;
    if (/контрольная/.test(wt)) return 1500;
    
    return 1500;
}

function extractUniversity(title) {
    const match = title.match(/(ООО|ПАО|ОАО|АО|ЗАО)\s+[«"]?([^»"()]+)[»"]?/);
    if (match) {
        return `${match[1]} ${match[2].trim()}`;
    }
    return null;
}

function determineComposition(workType, title) {
    const wt = workType.toLowerCase();
    const t = title.toLowerCase();
    
    if (/дипломная/.test(wt)) {
        if (/газопровод|электро|система|модернизация/.test(t)) {
            return 'Пояснительная записка, графика, чертежи';
        }
        return 'Пояснительная записка, графика';
    }
    if (/курсовая/.test(wt)) {
        if (/проектирование|расчет|схема/.test(t)) {
            return 'Пояснительная записка, чертежи';
        }
        return 'Пояснительная записка';
    }
    if (/отчет/.test(wt)) {
        return 'Отчёт, дневник практики';
    }
    
    return 'Пояснительная записка';
}

function escapeSql(str) {
    if (!str) return 'NULL';
    return "'" + str.replace(/'/g, "''").replace(/\\/g, "\\\\") + "'";
}

function generateInsert(folderName) {
    const {title, workType} = extractWorkInfo(folderName);
    const subject = determineSubject(title);
    const price = determinePrice(workType, title);
    const university = extractUniversity(title);
    const composition = determineComposition(workType, title);
    const description = `Работа по теме: ${title}`;
    
    return `INSERT INTO t_p63326274_course_download_plat.works 
(title, work_type, subject, description, composition, universities, price_points, yandex_disk_link)
VALUES 
(${escapeSql(title)}, ${escapeSql(workType)}, ${escapeSql(subject)}, ${escapeSql(description)}, ${escapeSql(composition)}, ${escapeSql(university)}, ${price}, ${escapeSql(BASE_URL)});
`;
}

function fetchBatch(offset) {
    return new Promise((resolve, reject) => {
        const path = `/v1/disk/public/resources?public_key=${encodeURIComponent(PUBLIC_KEY)}&limit=100&offset=${offset}`;
        
        const options = {
            hostname: API_BASE,
            path: path,
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };
        
        https.get(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    console.log('Fetching all works from Yandex Disk...');
    
    let allSql = [];
    allSql.push('-- SQL INSERT statements for all 486 works from Yandex Disk');
    allSql.push('-- Generated automatically from API data');
    allSql.push('-- Source: https://disk.yandex.ru/d/usjmeUqnkY9IfQ');
    allSql.push('-- Total works: 486');
    allSql.push('-- Date: 2025-10-29');
    allSql.push('');
    allSql.push('-- Price ranges:');
    allSql.push('-- Практическая работа: 800-1200 points');
    allSql.push('-- Курсовая работа: 1500-2500 points');
    allSql.push('-- Отчет по практике: 1200-1800 points');
    allSql.push('-- Дипломная работа: 4000-7000 points');
    allSql.push('');
    
    let totalCount = 0;
    
    for (let offset of [0, 100, 200, 300, 400]) {
        console.log(`Fetching offset ${offset}...`);
        
        try {
            const data = await fetchBatch(offset);
            
            if (data._embedded && data._embedded.items) {
                allSql.push(`\n-- Batch starting at offset ${offset}\n`);
                
                for (let item of data._embedded.items) {
                    if (item.type === 'dir') {
                        const sql = generateInsert(item.name);
                        allSql.push(sql);
                        totalCount++;
                    }
                }
            }
            
            console.log(`Processed ${totalCount} works so far...`);
        } catch (error) {
            console.error(`Error at offset ${offset}:`, error.message);
        }
    }
    
    const finalSql = allSql.join('\n');
    fs.writeFileSync('db_migrations_draft/insert_all_486_works.sql', finalSql, 'utf8');
    
    console.log(`\n✓ Complete! Generated SQL for ${totalCount} works.`);
    console.log('Output file: db_migrations_draft/insert_all_486_works.sql');
}

main().catch(console.error);
