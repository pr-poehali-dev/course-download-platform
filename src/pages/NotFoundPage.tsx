import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Icon from "@/components/ui/icon";

const NotFoundPage = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>404 - Страница не найдена | Tech Forma</title>
        <meta name="description" content="Запрашиваемая страница не найдена. Вернитесь на главную или перейдите в каталог чертежей и 3D-моделей." />
        <meta name="robots" content="noindex, nofollow" />
        <meta httpEquiv="status" content="404" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation isLoggedIn={false} />
        
        <main className="flex-grow flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-2xl">
            <div className="mb-8">
              <Icon name="FileQuestion" size={120} className="text-primary/30 mx-auto mb-6" />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-4 text-foreground">404</h1>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
              Страница не найдена (404)
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-2">
              Запрашиваемая страница <code className="bg-muted px-2 py-1 rounded text-sm">{location.pathname}</code> не существует.
            </p>
            <p className="text-base md:text-lg text-muted-foreground mb-8">
              Возможно, она была удалена или вы ввели неверный адрес.
              <br />
              Вернитесь на главную или воспользуйтесь каталогом работ.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold shadow-md"
              >
                <Icon name="Home" size={20} />
                На главную
              </a>
              <a
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-border rounded-lg hover:bg-accent transition-colors font-semibold text-foreground"
              >
                <Icon name="Search" size={20} />
                Каталог работ
              </a>
            </div>
            
            <div className="text-sm text-muted-foreground/60 mt-8">
              <p>Статус ответа сервера: <strong>404 Not Found</strong></p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default NotFoundPage;