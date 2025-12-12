export default function SEOContentSection() {
  return (
    <section className="w-full py-20 bg-muted/30 border-b border-border" id="about-service">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground section-title-line">
            Каталог чертежей DWG и 3D-моделей для инженеров
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Техническая документация, готовые проекты и расчёты для студентов и специалистов
          </p>
        </div>
        
        <div className="space-y-8">
          <div className="cyber-card rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Техническая документация в форматах AutoCAD, KOMPAS, SolidWorks</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              TechForma — библиотека инженерных материалов для студентов и специалистов. 
              Файлы в форматах DWG, DXF, STEP, STL, PDF с детальными чертежами, 
              объемными моделями и проверенными расчётами по ГОСТ.
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-xl">✓</span>
                <span><strong className="text-foreground">Более 500 работ</strong> — чертежи, модели, расчёты по механике, электрике, строительству</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-xl">✓</span>
                <span><strong className="text-foreground">Проверенные форматы</strong> — DWG, DXF, STEP, STL, PDF и другие CAD-форматы</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-xl">✓</span>
                <span><strong className="text-foreground">Система баллов</strong> — зарабатывайте на загрузке своих разработок</span>
              </li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="cyber-card rounded-xl p-6">
              <h4 className="text-xl font-bold mb-3 text-foreground">Для студентов</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Примеры оформления чертежей, образцы расчётов, справочные материалы. 
                Используйте как основу для своих проектов с обязательной адаптацией.
              </p>
            </div>
            <div className="cyber-card rounded-xl p-6">
              <h4 className="text-xl font-bold mb-3 text-foreground">Для инженеров</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Типовые решения, готовые узлы, проверенные расчёты. 
                Экономьте время на рутинных задачах и делитесь своими наработками.
              </p>
            </div>
          </div>

          <div className="cyber-card rounded-xl p-6 border-2 border-primary/30 bg-primary/5">
            <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="text-primary text-xl">⚡</span>
              Справочные материалы для обучения
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Платформа предоставляет образовательные материалы для изучения. Применяйте как справочник для своих проектов, 
              обязательно адаптируя под свои задачи.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}