export default function SEOContentSection() {
  return (
    <section className="w-full py-20 bg-muted/30 border-b border-border" id="about-service">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground section-title-line">
            Скачать чертежи DWG, 3D-модели и CAD проекты
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Обмен техническими материалами между инженерами и студентами технических специальностей
          </p>
        </div>
        
        <div className="space-y-8">
          <div className="cyber-card rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Платформа для скачивания чертежей DWG и 3D-моделей CAD</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              TechForma — специализированная платформа для обмена инженерными материалами. 
              Здесь вы найдёте чертежи DWG/DXF, 3D-модели STEP/STL, технические расчёты, 
              проектную документацию и другие материалы для обучения и работы.
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-xl">✓</span>
                <span><strong className="text-foreground">500+ материалов</strong> — чертежи, модели, расчёты по всем инженерным направлениям</span>
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
              Материалы предназначены для образовательных целей
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Все материалы — справочные пособия для обучения. Используйте как основу для собственных разработок 
              с обязательной адаптацией под ваши задачи.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}