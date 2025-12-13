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
        
        <div className="space-y-6">
          <div className="cyber-card rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Техническая документация в форматах AutoCAD, KOMPAS, SolidWorks</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              TechForma — библиотека инженерных материалов для студентов и специалистов. 
              Файлы в форматах DWG, DXF, STEP, STL, PDF с детальными чертежами и проверенными расчётами по ГОСТ.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-xl">✓</span>
                <span><strong className="text-foreground">500+ работ</strong> по механике, электрике, строительству</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-xl">✓</span>
                <span><strong className="text-foreground">Проверенные форматы</strong> DWG, DXF, STEP, STL, PDF</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}