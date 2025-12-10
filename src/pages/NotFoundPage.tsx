import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
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
        <title>404 - Страница не найдена | Техформа</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <main className="flex-grow flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-2xl">
            <div className="mb-8">
              <Icon name="FileQuestion" size={120} className="text-primary/30 mx-auto mb-6" />
            </div>
            
            <h1 className="text-6xl font-bold mb-4 text-foreground">404</h1>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Страница не найдена
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              К сожалению, запрашиваемая страница не существует или была удалена.
              <br />
              Проверьте правильность введённого адреса или вернитесь на главную.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
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
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default NotFoundPage;
