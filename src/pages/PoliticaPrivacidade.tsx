import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function PoliticaPrivacidade() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>
          
          <Card className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Informações que Coletamos</h2>
              <p className="text-muted-foreground">
                Coletamos informações que você nos fornece diretamente, incluindo nome, CPF, data de nascimento, 
                telefone e e-mail quando você se cadastra em nossa plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Como Usamos Suas Informações</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Para criar e gerenciar sua conta</li>
                <li>Para verificar sua elegibilidade para cupons de aniversário</li>
                <li>Para enviar notificações sobre novos benefícios e ofertas</li>
                <li>Para melhorar nossos serviços e experiência do usuário</li>
                <li>Para prevenir fraudes e garantir a segurança da plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Compartilhamento de Informações</h2>
              <p className="text-muted-foreground mb-4">
                Não vendemos suas informações pessoais. Compartilhamos apenas quando necessário:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Com estabelecimentos parceiros quando você emite um cupom</li>
                <li>Com prestadores de serviços que nos auxiliam (hospedagem, pagamentos)</li>
                <li>Quando exigido por lei ou autoridades competentes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Seus Direitos (LGPD)</h2>
              <p className="text-muted-foreground mb-4">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Confirmar a existência de tratamento de dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar a anonimização, bloqueio ou eliminação de dados</li>
                <li>Solicitar a portabilidade de dados</li>
                <li>Eliminar dados tratados com seu consentimento</li>
                <li>Revogar consentimento a qualquer momento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Segurança dos Dados</h2>
              <p className="text-muted-foreground">
                Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados contra 
                acesso não autorizado, perda, destruição ou alteração. Utilizamos criptografia SSL, 
                autenticação segura e backups regulares.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Cookies e Tecnologias Similares</h2>
              <p className="text-muted-foreground">
                Utilizamos cookies essenciais para o funcionamento do site e cookies analíticos para 
                melhorar sua experiência. Você pode gerenciar suas preferências através das configurações 
                do navegador.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Retenção de Dados</h2>
              <p className="text-muted-foreground">
                Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política, 
                ou conforme exigido por lei. Após esse período, os dados são eliminados de forma segura.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Alterações nesta Política</h2>
              <p className="text-muted-foreground">
                Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas 
                por e-mail ou através de aviso em nosso site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contato</h2>
              <p className="text-muted-foreground">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:
              </p>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <p><strong>E-mail:</strong> privacidade@aniversariantevip.com.br</p>
                <p><strong>Telefone:</strong> (11) 99999-9999</p>
                <p><strong>Data da última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </section>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
