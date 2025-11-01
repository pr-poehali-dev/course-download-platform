-- Исправляем folder_path с правильными типами работ
-- диплом → дипломная работа
-- курсовая → курсовая работа  
-- практическая → практическая работа
-- и т.д.

UPDATE t_p63326274_course_download_plat.works
SET folder_path = CASE 
    WHEN work_type = 'диплом' THEN title || ' (дипломная работа)'
    WHEN work_type = 'дипломная' THEN title || ' (дипломная работа)'
    WHEN work_type = 'курсовая' THEN title || ' (курсовая работа)'
    WHEN work_type = 'курсовой' THEN title || ' (курсовая работа)'
    WHEN work_type = 'практическая' THEN title || ' (практическая работа)'
    WHEN work_type = 'практика' THEN title || ' (практическая работа)'
    WHEN work_type = 'отчет по практике' THEN title || ' (отчет по практике)'
    WHEN work_type = 'реферат' THEN title || ' (реферат)'
    WHEN work_type = 'контрольная' THEN title || ' (контрольная работа)'
    WHEN work_type = 'лабораторная' THEN title || ' (лабораторная работа)'
    WHEN work_type = 'исследовательская практика' THEN title || ' (исследовательская практика)'
    ELSE title || ' (' || work_type || ')'
END;