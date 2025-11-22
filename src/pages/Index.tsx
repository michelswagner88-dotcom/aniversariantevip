import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Gift, MapPin, Search, LogOut, Download, User, Calendar, Building, X, Phone, Clock, ExternalLink, Instagram, ChevronDown, Mail, Heart, Menu } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NavLink } from "@/components/NavLink";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CATEGORIAS_ESTABELECIMENTO } from "@/lib/constants";
import { useFavoritos } from "@/hooks/useFavoritos";

const estabelecimentosFicticios = [
  // Estabelecimentos exemplo de outras cidades (manter para demonstração)
  // Outros estabelecimentos de SC
  {
    id: "11",
    nomeFantasia: "Loja Surf Life",
    categoria: "loja",
    endereco: "Rua das Rendeiras, 78 - Lagoa da Conceição, Florianópolis - SC",
    cidade: "Florianópolis",
    estado: "SC",
    diasHorarioFuncionamento: "Seg a Sáb: 9h às 19h",
    beneficiosAniversariante: "20% de desconto em toda a loja",
    regrasAniversariante: "Válido no mês do aniversário. Não acumulativo com outras promoções.",
    periodoValidade: "mes",
    linkCardapioDigital: "",
    logoUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(48) 3232-1010",
    whatsapp: "(48) 99232-1010",
    emailContato: "vendas@surflife.com.br",
    instagram: "surflifebrasil",
    facebook: "surflifeoficial",
  },
  {
    id: "12",
    nomeFantasia: "Churrascaria Bom Sabor",
    categoria: "restaurante",
    endereco: "Av. Acioni Souza Filho, 1800 - Kobrasol, São José - SC",
    cidade: "São José",
    estado: "SC",
    diasHorarioFuncionamento: "Seg a Dom: 11h às 15h | 18h às 23h",
    beneficiosAniversariante: "Rodízio completo grátis para o aniversariante",
    regrasAniversariante: "Válido no dia do aniversário. Mesa para no mínimo 2 pessoas.",
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.bomsabor.com.br",
    logoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(48) 3288-7700",
    whatsapp: "(48) 99288-7700",
    emailContato: "contato@bomsabor.com.br",
    instagram: "bomsaborsj",
    facebook: "bomsaboroficial",
  },
  {
    id: "7",
    nomeFantasia: "Bar do Alemão",
    categoria: "bar",
    endereco: "Rua José Maria da Luz, 123 - Centro, São José - SC",
    cidade: "São José",
    estado: "SC",
    diasHorarioFuncionamento: "Ter a Dom: 16h às 00h",
    beneficiosAniversariante: "Porção de petiscos grátis + 1 chopp",
    regrasAniversariante: "Válido no dia do aniversário. Apresentar documento com foto.",
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.bardoalemao.com.br",
    logoUrl: "https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(48) 3246-8899",
    whatsapp: "(48) 99246-8899",
    emailContato: "alemao@bardoalemao.com.br",
    instagram: "bardoalemaosj",
    facebook: "bardoalemaooficial",
  },
  {
    id: "8",
    nomeFantasia: "Café & Cia",
    categoria: "restaurante",
    endereco: "Av. Pedra Branca, 2500 - Pedra Branca, Palhoça - SC",
    cidade: "Palhoça",
    estado: "SC",
    diasHorarioFuncionamento: "Seg a Sáb: 8h às 20h | Dom: 9h às 18h",
    beneficiosAniversariante: "Bolo do dia + café especial grátis",
    regrasAniversariante: "Válido na semana do aniversário.",
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.cafeecia.com.br",
    logoUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(48) 3242-3344",
    whatsapp: "(48) 99242-3344",
    emailContato: "contato@cafeecia.com.br",
    instagram: "cafeeciapalhoca",
    facebook: "cafeeciaoficial",
  },
  {
    id: "9",
    nomeFantasia: "Academia Fitness Pro",
    categoria: "servico",
    endereco: "Rua Nereu Ramos, 456 - Centro, Palhoça - SC",
    cidade: "Palhoça",
    estado: "SC",
    diasHorarioFuncionamento: "Seg a Sex: 6h às 22h | Sáb: 8h às 14h",
    beneficiosAniversariante: "1 mês de musculação grátis",
    regrasAniversariante: "Válido no mês do aniversário. Apenas para novos alunos.",
    periodoValidade: "mes",
    linkCardapioDigital: "",
    logoUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(48) 3279-1122",
    whatsapp: "(48) 99279-1122",
    emailContato: "info@fitnesspro.com.br",
    instagram: "fitnesspropalhoca",
    facebook: "fitnessprooficial",
  },
  {
    id: "10",
    nomeFantasia: "Hamburgueria do Cheff",
    categoria: "restaurante",
    endereco: "Rua Manoel Isidoro da Silveira, 789 - Centro, Biguaçu - SC",
    cidade: "Biguaçu",
    estado: "SC",
    diasHorarioFuncionamento: "Ter a Dom: 18h às 23h",
    beneficiosAniversariante: "Hambúrguer artesanal grátis",
    regrasAniversariante: "Válido no dia do aniversário. Apresentar documento com foto.",
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.hamburgueriadocheff.com.br",
    logoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(48) 3285-5566",
    whatsapp: "(48) 99285-5566",
    emailContato: "pedidos@hamburgueriadocheff.com.br",
    instagram: "hamburgueriadocheff",
    facebook: "hamburgueriadocheffoficial",
  },
  {
    id: "11",
    nomeFantasia: "Loja Moda Bella",
    categoria: "loja",
    endereco: "Av. Tereza Cristina, 321 - Centro, Biguaçu - SC",
    cidade: "Biguaçu",
    estado: "SC",
    diasHorarioFuncionamento: "Seg a Sex: 9h às 19h | Sáb: 9h às 17h",
    beneficiosAniversariante: "15% de desconto em toda a loja",
    regrasAniversariante: "Válido no mês do aniversário. Não acumulativo com outras promoções.",
    periodoValidade: "mes",
    linkCardapioDigital: "",
    logoUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(48) 3243-6677",
    whatsapp: "(48) 99243-6677",
    emailContato: "vendas@modabella.com.br",
    instagram: "modabellabiguacu",
    facebook: "modabellaoficial",
  },
  // Paraná - Curitiba
  {
    id: "12",
    nomeFantasia: "Restaurante Madero",
    categoria: "restaurante",
    endereco: "Av. Cândido de Abreu, 127 - Centro Cívico, Curitiba - PR",
    cidade: "Curitiba",
    estado: "PR",
    diasHorarioFuncionamento: "Seg a Dom: 11h30 às 23h",
    beneficiosAniversariante: "Hambúrguer grátis para o aniversariante",
    regrasAniversariante: "Válido no dia do aniversário. Apresentar documento com foto.",
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.madero.com.br",
    logoUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(41) 3322-4455",
    whatsapp: "(41) 99322-4455",
    emailContato: "curitiba@madero.com.br",
    instagram: "maderocuritiba",
    facebook: "maderocwb",
  },
  {
    id: "13",
    nomeFantasia: "Bar do Alemão Curitiba",
    categoria: "bar",
    endereco: "Rua Comendador Araújo, 731 - Batel, Curitiba - PR",
    cidade: "Curitiba",
    estado: "PR",
    diasHorarioFuncionamento: "Seg a Sáb: 17h às 01h",
    beneficiosAniversariante: "1 chopp artesanal grátis",
    regrasAniversariante: "Válido no dia do aniversário. Apresentar documento com foto.",
    periodoValidade: "dia",
    linkCardapioDigital: "",
    logoUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(41) 3028-7788",
    whatsapp: "(41) 99028-7788",
    emailContato: "contato@baraleماocwb.com.br",
    instagram: "baraleماocuritiba",
    facebook: "baraleماocwb",
  },
  // Rio Grande do Sul - Porto Alegre
  {
    id: "14",
    nomeFantasia: "Churrascaria Barranco",
    categoria: "restaurante",
    endereco: "Av. Protásio Alves, 1578 - Petrópolis, Porto Alegre - RS",
    cidade: "Porto Alegre",
    estado: "RS",
    diasHorarioFuncionamento: "Seg a Dom: 11h30 às 15h | 19h às 23h",
    beneficiosAniversariante: "Rodízio completo grátis",
    regrasAniversariante: "Válido no dia do aniversário. Mesa para no mínimo 2 pessoas.",
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.barranco.com.br",
    logoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(51) 3333-5577",
    whatsapp: "(51) 99333-5577",
    emailContato: "reservas@barranco.com.br",
    instagram: "barrancopoa",
    facebook: "barrancooficial",
  },
  {
    id: "15",
    nomeFantasia: "Pub Dado Bier",
    categoria: "bar",
    endereco: "Rua da República, 545 - Cidade Baixa, Porto Alegre - RS",
    cidade: "Porto Alegre",
    estado: "RS",
    diasHorarioFuncionamento: "Ter a Dom: 18h às 02h",
    beneficiosAniversariante: "1 drink especial grátis",
    regrasAniversariante: "Válido no dia do aniversário. Apresentar documento com foto.",
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.dadobier.com.br",
    logoUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(51) 3061-8899",
    whatsapp: "(51) 99061-8899",
    emailContato: "contato@dadobier.com.br",
    instagram: "dadobierpoa",
    facebook: "dadobierpoa",
  },
  // Minas Gerais - Belo Horizonte
  {
    id: "16",
    nomeFantasia: "Xapuri Restaurante",
    categoria: "restaurante",
    endereco: "Rua Mandacaru, 260 - Pampulha, Belo Horizonte - MG",
    cidade: "Belo Horizonte",
    estado: "MG",
    diasHorarioFuncionamento: "Seg a Dom: 11h30 às 23h",
    beneficiosAniversariante: "Sobremesa típica mineira grátis",
    regrasAniversariante: "Válido na semana do aniversário.",
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.xapuri.com.br",
    logoUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(31) 3491-5198",
    whatsapp: "(31) 99491-5198",
    emailContato: "reservas@xapuri.com.br",
    instagram: "xapuribh",
    facebook: "xapurioficial",
  },
  {
    id: "17",
    nomeFantasia: "Bar da Lora",
    categoria: "bar",
    endereco: "Rua Rio Grande do Norte, 1168 - Savassi, Belo Horizonte - MG",
    cidade: "Belo Horizonte",
    estado: "MG",
    diasHorarioFuncionamento: "Seg a Dom: 11h às 00h",
    beneficiosAniversariante: "Porção de torresmo + 1 cerveja grátis",
    regrasAniversariante: "Válido no dia do aniversário. Apresentar documento com foto.",
    periodoValidade: "dia",
    linkCardapioDigital: "",
    logoUrl: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(31) 3227-6932",
    whatsapp: "(31) 99227-6932",
    emailContato: "contato@bardalora.com.br",
    instagram: "bardalorabh",
    facebook: "bardaloraoficial",
  },
  // Rio de Janeiro - Rio de Janeiro
  {
    id: "18",
    nomeFantasia: "Café do Alto",
    categoria: "restaurante",
    endereco: "Rua Paschoal Carlos Magno, 121 - Santa Teresa, Rio de Janeiro - RJ",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    diasHorarioFuncionamento: "Ter a Dom: 12h às 22h",
    beneficiosAniversariante: "Feijoada completa grátis",
    regrasAniversariante: "Válido no dia do aniversário. Mesa para no mínimo 2 pessoas.",
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.cafedoalto.com.br",
    logoUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(21) 2507-3172",
    whatsapp: "(21) 99507-3172",
    emailContato: "reservas@cafedoalto.com.br",
    instagram: "cafedoaltorj",
    facebook: "cafedoalto",
  },
  {
    id: "19",
    nomeFantasia: "Boteco Belmonte",
    categoria: "bar",
    endereco: "Rua Visconde de Caravelas, 184 - Botafogo, Rio de Janeiro - RJ",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    diasHorarioFuncionamento: "Seg a Dom: 10h às 02h",
    beneficiosAniversariante: "Bolinho de bacalhau + chopp grátis",
    regrasAniversariante: "Válido no dia do aniversário. Apresentar documento com foto.",
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.belmonte.com.br",
    logoUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(21) 2266-0838",
    whatsapp: "(21) 99266-0838",
    emailContato: "botafogo@belmonte.com.br",
    instagram: "belmonterj",
    facebook: "belmontebotafogo",
  },
  {
    id: "20",
    nomeFantasia: "Academia BodyTech",
    categoria: "servico",
    endereco: "Av. das Américas, 5150 - Barra da Tijuca, Rio de Janeiro - RJ",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    diasHorarioFuncionamento: "Seg a Sex: 6h às 23h | Sáb e Dom: 8h às 20h",
    beneficiosAniversariante: "1 mês de personal trainer grátis",
    regrasAniversariante: "Válido no mês do aniversário. Apenas para alunos matriculados.",
    periodoValidade: "mes",
    linkCardapioDigital: "",
    logoUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(21) 3139-9000",
    whatsapp: "(21) 99139-9000",
    emailContato: "barra@bodytech.com.br",
    instagram: "bodytechrj",
    facebook: "bodytechoficial",
  },
  // São Paulo - São Paulo
  {
    id: "21",
    nomeFantasia: "D.O.M. Restaurante",
    categoria: "restaurante",
    endereco: "Rua Barão de Capanema, 549 - Jardins, São Paulo - SP",
    cidade: "São Paulo",
    estado: "SP",
    diasHorarioFuncionamento: "Ter a Sáb: 19h às 23h",
    beneficiosAniversariante: "Sobremesa especial grátis",
    regrasAniversariante: "Válido na semana do aniversário. Necessário reserva prévia.",
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.domrestaurante.com.br",
    logoUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(11) 3088-0761",
    whatsapp: "(11) 99088-0761",
    emailContato: "reservas@domrestaurante.com.br",
    instagram: "domrestaurante",
    facebook: "domrestaurantesp",
  },
  {
    id: "22",
    nomeFantasia: "Bar Original",
    categoria: "bar",
    endereco: "Rua da Consolação, 3061 - Jardins, São Paulo - SP",
    cidade: "São Paulo",
    estado: "SP",
    diasHorarioFuncionamento: "Seg a Sáb: 12h às 02h",
    beneficiosAniversariante: "Drink da casa grátis",
    regrasAniversariante: "Válido no dia do aniversário. Apresentar documento com foto.",
    periodoValidade: "dia",
    linkCardapioDigital: "",
    logoUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(11) 3064-4331",
    whatsapp: "(11) 99064-4331",
    emailContato: "contato@baroriginal.com.br",
    instagram: "baroriginalsp",
    facebook: "baroriginal",
  },
  {
    id: "23",
    nomeFantasia: "Livraria Cultura",
    categoria: "loja",
    endereco: "Av. Paulista, 2073 - Consolação, São Paulo - SP",
    cidade: "São Paulo",
    estado: "SP",
    diasHorarioFuncionamento: "Seg a Sáb: 9h às 22h | Dom: 10h às 20h",
    beneficiosAniversariante: "20% de desconto em qualquer livro",
    regrasAniversariante: "Válido no mês do aniversário. Não acumulativo.",
    periodoValidade: "mes",
    linkCardapioDigital: "",
    logoUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(11) 3170-4033",
    whatsapp: "(11) 99170-4033",
    emailContato: "paulista@livrariacultura.com.br",
    instagram: "livrariaculturasp",
    facebook: "livrariacultura",
  },
  // Goiás - Goiânia
  {
    id: "24",
    nomeFantasia: "Churrascaria Boi na Brasa",
    categoria: "restaurante",
    endereco: "Av. T-4, 1230 - Setor Bueno, Goiânia - GO",
    cidade: "Goiânia",
    estado: "GO",
    diasHorarioFuncionamento: "Seg a Dom: 11h às 15h | 18h30 às 23h",
    beneficiosAniversariante: "Rodízio de carnes grátis",
    regrasAniversariante: "Válido no dia do aniversário. Mesa para no mínimo 2 pessoas.",
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.boinabrasa.com.br",
    logoUrl: "https://images.unsplash.com/photo-1558030006-450675393462?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(62) 3251-3030",
    whatsapp: "(62) 99251-3030",
    emailContato: "reservas@boinabrasa.com.br",
    instagram: "boinabrasagyn",
    facebook: "boinabrasa",
  },
  {
    id: "25",
    nomeFantasia: "Pub Cervejaria do Lago",
    categoria: "bar",
    endereco: "Av. Assis Chateaubriand, 145 - Setor Oeste, Goiânia - GO",
    cidade: "Goiânia",
    estado: "GO",
    diasHorarioFuncionamento: "Qua a Dom: 17h às 00h",
    beneficiosAniversariante: "Cerveja artesanal grátis",
    regrasAniversariante: "Válido no dia do aniversário. Apresentar documento com foto.",
    periodoValidade: "dia",
    linkCardapioDigital: "",
    logoUrl: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(62) 3087-9988",
    whatsapp: "(62) 99087-9988",
    emailContato: "contato@cervejariadolago.com.br",
    instagram: "cervejariadolagogyn",
    facebook: "cervejariadolago",
  },
  // Distrito Federal - Brasília
  {
    id: "26",
    nomeFantasia: "Restaurante Universal",
    categoria: "restaurante",
    endereco: "SCLS 404 Bloco B - Asa Sul, Brasília - DF",
    cidade: "Brasília",
    estado: "DF",
    diasHorarioFuncionamento: "Seg a Dom: 11h30 às 23h",
    beneficiosAniversariante: "Prato principal grátis para o aniversariante",
    regrasAniversariante: "Válido no dia do aniversário. Mesa para no mínimo 2 pessoas.",
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.universal.com.br",
    logoUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(61) 3225-6464",
    whatsapp: "(61) 99225-6464",
    emailContato: "reservas@universal.com.br",
    instagram: "universalbsb",
    facebook: "universalrestaurante",
  },
  {
    id: "27",
    nomeFantasia: "Bar Beirute",
    categoria: "bar",
    endereco: "SCLS 109 Bloco A - Asa Sul, Brasília - DF",
    cidade: "Brasília",
    estado: "DF",
    diasHorarioFuncionamento: "Seg a Dom: 11h às 02h",
    beneficiosAniversariante: "Beirute especial + drink grátis",
    regrasAniversariante: "Válido no dia do aniversário. Apresentar documento com foto.",
    periodoValidade: "dia",
    linkCardapioDigital: "https://cardapio.barbeirute.com.br",
    logoUrl: "https://images.unsplash.com/photo-1521305916504-4a1121188589?w=200&h=200&fit=crop&auto=format&fm=webp&q=75",
    telefoneContato: "(61) 3244-1717",
    whatsapp: "(61) 99244-1717",
    emailContato: "contato@barbeirute.com.br",
    instagram: "barbeirutebsb",
    facebook: "barbeirute",
  },
];

type Estabelecimento = {
  id: string;
  nomeFantasia: string;
  categoria: string | string[];
  endereco: string;
  cidade: string;
  estado: string;
  diasHorarioFuncionamento: string;
  beneficiosAniversariante: string;
  regrasAniversariante: string;
  periodoValidade: string;
  linkCardapioDigital: string;
  logoUrl: string;
  telefoneContato: string;
  whatsapp: string;
  emailContato: string;
  instagram: string;
  facebook: string;
};

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const cupomRef = useRef<HTMLDivElement>(null);
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>(estabelecimentosFicticios);
  const [loadingEstabelecimentos, setLoadingEstabelecimentos] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("todas");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [selectedCidade, setSelectedCidade] = useState<string>("todas");
  const [selectedEstabelecimento, setSelectedEstabelecimento] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [cupomGerado, setCupomGerado] = useState<any>(null);
  const [showCupom, setShowCupom] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  // Hook de favoritos
  const { favoritos, toggleFavorito, isFavorito, loading: favoritosLoading } = useFavoritos(currentUser?.id || null);

  // Função para abrir Google Maps
  const openGoogleMaps = (endereco: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
    window.open(url, '_blank');
  };

  // Buscar estabelecimentos do banco de dados
  useEffect(() => {
    const fetchEstabelecimentos = async () => {
      try {
        setLoadingEstabelecimentos(true);
        const { data, error } = await supabase
          .from('estabelecimentos')
          .select('*');

        if (error) {
          console.error('Erro ao buscar estabelecimentos:', error);
          return;
        }
        
        // Mapear estabelecimentos do banco para o formato da UI
        const estabelecimentosReais = (data || []).map(est => ({
          id: est.id,
          nomeFantasia: est.nome_fantasia || est.razao_social,
          categoria: est.categoria || "outros",
          endereco: est.endereco || "",
          cidade: est.cidade || "Sem cidade",
          estado: est.estado || "SC",
          diasHorarioFuncionamento: "",
          beneficiosAniversariante: est.descricao_beneficio || "",
          regrasAniversariante: "Consulte o estabelecimento para detalhes",
          periodoValidade: "dia",
          linkCardapioDigital: "",
          logoUrl: est.logo_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop",
          telefoneContato: est.telefone || "",
          whatsapp: est.telefone || "",
          emailContato: "",
          instagram: "",
          facebook: "",
        }));

        // Combinar estabelecimentos reais com os fictícios
        setEstabelecimentos([...estabelecimentosReais, ...estabelecimentosFicticios]);
      } catch (error) {
        console.error('Erro ao buscar estabelecimentos:', error);
      } finally {
        setLoadingEstabelecimentos(false);
      }
    };

    fetchEstabelecimentos();
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setSession(session);
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        if (roles?.some(r => r.role === "aniversariante")) {
          const { data: aniversariante } = await supabase
            .from("aniversariantes")
            .select("*")
            .eq("id", session.user.id)
            .single();

          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (aniversariante && profile) {
            const userData = {
              id: session.user.id,
              nomeCompleto: profile.nome,
              email: profile.email,
              cpf: aniversariante.cpf,
              dataNascimento: aniversariante.data_nascimento,
            };
            setCurrentUser(userData);
          }
        }
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setSession(null);
      } else if (event === 'SIGNED_IN' && session) {
        setSession(session);
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        if (roles?.some(r => r.role === "aniversariante")) {
          const { data: aniversariante } = await supabase
            .from("aniversariantes")
            .select("*")
            .eq("id", session.user.id)
            .single();

          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (aniversariante && profile) {
            const userData = {
              id: session.user.id,
              nomeCompleto: profile.nome,
              email: profile.email,
              cpf: aniversariante.cpf,
              dataNascimento: aniversariante.data_nascimento,
            };
            setCurrentUser(userData);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const pendingId = sessionStorage.getItem("pendingEstabelecimento");
    if (pendingId && currentUser) {
      const estabelecimento = estabelecimentos.find((e) => e.id === pendingId);
      if (estabelecimento) {
        setSelectedEstabelecimento(estabelecimento);
        setDialogOpen(true);
        sessionStorage.removeItem("pendingEstabelecimento");
      }
    }
  }, [currentUser, estabelecimentos]);

  const handleEmitirCupom = (estabelecimento: any) => {
    if (!currentUser || !session) {
      sessionStorage.setItem("pendingEstabelecimento", estabelecimento.id);
      toast({
        variant: "destructive",
        title: "Login Necessário",
        description: "Você precisa estar logado como aniversariante",
      });
      navigate("/login/aniversariante");
    } else {
      setSelectedEstabelecimento(estabelecimento);
      setDialogOpen(true);
    }
  };

  const handleSolicitarCupom = async () => {
    if (!currentUser || !selectedEstabelecimento) return;

    try {
      const codigo = `ANIV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      const { data: cupom, error } = await supabase
        .from("cupons")
        .insert({
          codigo: codigo,
          estabelecimento_id: selectedEstabelecimento.id,
          aniversariante_id: currentUser.id,
          data_emissao: new Date().toISOString(),
          usado: false,
        })
        .select()
        .single();

      if (error) throw error;

      const novoCupom = {
        id: cupom.id,
        estabelecimentoId: selectedEstabelecimento.id,
        estabelecimentoNome: selectedEstabelecimento.nomeFantasia,
        estabelecimentoLogo: selectedEstabelecimento.logoUrl,
        aniversarianteId: currentUser.id,
        aniversarianteNome: currentUser.nomeCompleto,
        aniversarianteDataNascimento: currentUser.dataNascimento,
        regras: selectedEstabelecimento.regrasAniversariante,
        codigo: codigo,
        dataEmissao: new Date().toISOString(),
        usado: false,
      };

      setCupomGerado(novoCupom);
      setDialogOpen(false);
      setShowCupom(true);

      toast({
        title: "Cupom Emitido!",
        description: "Seu cupom foi gerado com sucesso",
      });
    } catch (error: any) {
      console.error("Erro ao emitir cupom:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível emitir o cupom. Tente novamente.",
      });
    }
  };

  const handlePrintCupom = () => {
    window.print();
  };

  const getCategoriaLabel = (categoria: string | string[]) => {
    const labels: Record<string, string> = {
      bar: "Bares",
      bares: "Bares",
      restaurante: "Restaurantes",
      restaurantes: "Restaurantes",
      balada: "Baladas",
      casas_noturnas: "Casas noturnas",
      loja: "Lojas",
      lojas: "Lojas",
      servico: "Serviços",
      servicos: "Serviços",
      cafeterias: "Cafeterias",
      confeitarias: "Confeitarias",
      entretenimento: "Entretenimento",
      farmacias: "Farmácias",
      hoteis_pousadas: "Hotéis / pousadas",
      sorveterias: "Sorveterias",
      outros: "Outros",
    };
    
    if (Array.isArray(categoria)) {
      return categoria.map(cat => labels[cat] || cat).join(", ");
    }
    return labels[categoria] || categoria;
  };

  // Get unique states and cities
  const estados = Array.from(new Set(estabelecimentos.map(e => e.estado))).sort();
  const cidadesDisponiveis = selectedEstado === "todos" 
    ? Array.from(new Set(estabelecimentos.map(e => e.cidade))).sort()
    : Array.from(new Set(estabelecimentos.filter(e => e.estado === selectedEstado).map(e => e.cidade))).sort();

  const filteredEstabelecimentos = estabelecimentos.filter((est) => {
    const matchesSearch = est.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = selectedCategoria === "todas" || est.categoria === selectedCategoria;
    const matchesEstado = selectedEstado === "todos" || est.estado === selectedEstado;
    const matchesCidade = selectedCidade === "todas" || est.cidade === selectedCidade;
    return matchesSearch && matchesCategoria && matchesEstado && matchesCidade;
  });

  // Group establishments by state and city
  const groupedEstabelecimentos = filteredEstabelecimentos.reduce((acc, est) => {
    const key = `${est.estado} - ${est.cidade}`;
    if (!acc[key]) {
      acc[key] = {
        estado: est.estado,
        cidade: est.cidade,
        estabelecimentos: []
      };
    }
    acc[key].estabelecimentos.push(est);
    return acc;
  }, {} as Record<string, { estado: string; cidade: string; estabelecimentos: typeof estabelecimentos }>);

  // Sort groups by state then city
  const sortedGroups = Object.values(groupedEstabelecimentos).sort((a, b) => {
    if (a.estado !== b.estado) {
      return a.estado.localeCompare(b.estado);
    }
    return a.cidade.localeCompare(b.cidade);
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSession(null);
    toast({
      title: "Até Logo!",
      description: "Você foi desconectado com sucesso",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
      {/* Hero */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-primary/10 to-background print:hidden">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-foreground leading-tight">
            O MAIOR GUIA DE BENEFÍCIOS PARA ANIVERSARIANTES DO BRASIL
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Descubra estabelecimentos parceiros que oferecem descontos e benefícios exclusivos.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 sm:py-6 md:py-8 bg-background print:hidden">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-col gap-3 max-w-4xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar estabelecimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 h-11 sm:h-10 text-base"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                <SelectTrigger className="w-full h-11 sm:h-10 text-base">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Categorias</SelectItem>
                  <SelectItem value="bar">Bares</SelectItem>
                  <SelectItem value="restaurante">Restaurantes</SelectItem>
                  <SelectItem value="balada">Baladas</SelectItem>
                  <SelectItem value="loja">Lojas</SelectItem>
                  <SelectItem value="servico">Serviços</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedEstado} onValueChange={(value) => {
                setSelectedEstado(value);
                setSelectedCidade("todas");
              }}>
                <SelectTrigger className="w-full h-11 sm:h-10 text-base">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Estados</SelectItem>
                  {estados.map(estado => (
                    <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCidade} onValueChange={setSelectedCidade}>
                <SelectTrigger className="w-full h-11 sm:h-10 text-base">
                  <SelectValue placeholder="Cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Cidades</SelectItem>
                  {cidadesDisponiveis.map(cidade => (
                    <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="py-6 sm:py-8 md:py-12 bg-background print:hidden">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          {sortedGroups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">Nenhum estabelecimento encontrado.</p>
            </div>
          ) : (
            sortedGroups.map((group) => (
              <div key={`${group.estado}-${group.cidade}`} className="mb-12">
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
                    <MapPin className="h-6 w-6" />
                    {group.estado} - {group.cidade}
                  </h2>
                  <div className="h-1 w-20 bg-primary/60 mt-2 rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {group.estabelecimentos.map((estabelecimento, index) => (
              <Card 
                key={estabelecimento.id} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative h-40 sm:h-48 overflow-hidden group">
                  <img
                    src={estabelecimento.logoUrl}
                    alt={estabelecimento.nomeFantasia}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Botão de favorito */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorito(estabelecimento.id);
                    }}
                    disabled={favoritosLoading}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                      isFavorito(estabelecimento.id)
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-background/80 text-foreground hover:bg-background'
                    }`}
                  >
                    <Heart 
                      className={`h-5 w-5 transition-all ${
                        isFavorito(estabelecimento.id) ? 'fill-current' : ''
                      }`}
                    />
                  </button>
                </div>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl mb-1">{estabelecimento.nomeFantasia}</CardTitle>
                  <p className="text-sm text-muted-foreground">{getCategoriaLabel(estabelecimento.categoria)}</p>
                </CardHeader>
                <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
                  <button
                    onClick={() => openGoogleMaps(estabelecimento.endereco)}
                    className="flex items-start gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left group"
                  >
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="line-clamp-2 group-hover:underline">{estabelecimento.endereco}</span>
                  </button>

                  {estabelecimento.diasHorarioFuncionamento && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{estabelecimento.diasHorarioFuncionamento}</span>
                    </div>
                  )}

                  {estabelecimento.telefoneContato && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <a href={`tel:${estabelecimento.telefoneContato}`} className="hover:text-primary transition-colors">
                        {estabelecimento.telefoneContato}
                      </a>
                    </div>
                  )}

                  {estabelecimento.instagram && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Instagram className="h-4 w-4 flex-shrink-0" />
                      <a 
                        href={`https://instagram.com/${estabelecimento.instagram}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        @{estabelecimento.instagram}
                      </a>
                    </div>
                  )}

                  {estabelecimento.linkCardapioDigital && (
                    <a 
                      href={estabelecimento.linkCardapioDigital} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                      Ver Cardápio Digital
                    </a>
                  )}
                  
                  {currentUser ? (
                    <>
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-sm font-semibold text-primary mb-1">🎁 Benefício</p>
                        <p className="text-sm sm:text-base text-foreground">{estabelecimento.beneficiosAniversariante}</p>
                      </div>

                      <div className="text-xs sm:text-sm text-muted-foreground italic">
                        <div>{estabelecimento.regrasAniversariante}</div>
                        <div className="mt-1">Apresentar cupom emitido.</div>
                      </div>
                      
                      <Button 
                        className="w-full h-11 text-base font-semibold" 
                        onClick={() => handleEmitirCupom(estabelecimento)}
                      >
                        Emitir Cupom
                      </Button>
                    </>
                  ) : (
                    <Link to="/cadastro/aniversariante" className="block">
                      <Button 
                        variant="outline"
                        className="w-full h-11 text-base font-semibold" 
                      >
                        Ver os Benefícios
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Detalhes do Estabelecimento</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Confira as informações e emita seu cupom
            </DialogDescription>
          </DialogHeader>
          {selectedEstabelecimento && (
            <div className="space-y-4 sm:space-y-5">
              {selectedEstabelecimento.logoUrl && (
                <div className="flex justify-center">
                  <img
                    src={selectedEstabelecimento.logoUrl}
                    alt={selectedEstabelecimento.nomeFantasia}
                    className="h-24 w-24 sm:h-32 sm:w-32 object-cover rounded-lg"
                  />
                </div>
              )}

              <div>
                <h3 className="font-semibold text-lg sm:text-xl mb-1">
                  {selectedEstabelecimento.nomeFantasia}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">{getCategoriaLabel(selectedEstabelecimento.categoria)}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-base">Localização</h4>
                <button
                  onClick={() => openGoogleMaps(selectedEstabelecimento.endereco)}
                  className="text-sm sm:text-base text-muted-foreground flex items-start gap-2 hover:text-primary transition-colors group w-full text-left"
                >
                  <MapPin className="h-4 w-4 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:underline">{selectedEstabelecimento.endereco}</span>
                </button>
              </div>

              {selectedEstabelecimento.diasHorarioFuncionamento && (
                <div>
                  <h4 className="font-semibold mb-2 text-base">Horário</h4>
                  <p className="text-sm sm:text-base text-muted-foreground">{selectedEstabelecimento.diasHorarioFuncionamento}</p>
                </div>
              )}

              {currentUser ? (
                <>
                  <div>
                    <h4 className="font-semibold mb-2 text-base">🎁 Benefício</h4>
                    <p className="text-sm sm:text-base text-primary font-medium">{selectedEstabelecimento.beneficiosAniversariante}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 text-base">Regras</h4>
                    <p className="text-sm sm:text-base text-muted-foreground">{selectedEstabelecimento.regrasAniversariante}</p>
                  </div>
                  
                  <Button onClick={handleSolicitarCupom} className="w-full h-12 text-base font-semibold">
                    <Gift className="mr-2 h-5 w-5" />
                    Emitir Cupom
                  </Button>
                </>
              ) : (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center space-y-4">
                  <div className="space-y-2">
                    <Gift className="h-12 w-12 mx-auto text-primary" />
                    <h4 className="font-semibold text-lg">Faça login para ver os benefícios</h4>
                    <p className="text-sm text-muted-foreground">
                      Cadastre-se gratuitamente e tenha acesso aos benefícios exclusivos para aniversariantes
                    </p>
                  </div>
                  <Link to="/cadastro/aniversariante">
                    <Button className="w-full h-12 text-base font-semibold">
                      <User className="mr-2 h-5 w-5" />
                      Cadastrar Agora
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cupom Modal */}
      {showCupom && cupomGerado && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 print:relative print:bg-transparent">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto print:max-h-none">
            <div className="sticky top-0 bg-background border-b p-3 sm:p-4 flex items-center justify-between print:hidden z-10">
              <h2 className="text-lg sm:text-xl font-bold">Seu Cupom</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCupom(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div ref={cupomRef} className="p-4 sm:p-6 md:p-8 bg-[hsl(0,0%,5%)]">
              <Card className="bg-gradient-to-br from-[hsl(45,100%,51%)] via-[hsl(0,0%,8%)] to-[hsl(45,100%,35%)] border-4 border-[hsl(45,100%,51%)] shadow-2xl">
                <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5">
                  <div className="text-center space-y-2 pb-3 sm:pb-4 border-b-4 border-dashed border-[hsl(45,100%,51%)]">
                    {cupomGerado.estabelecimentoLogo ? (
                      <img 
                        src={cupomGerado.estabelecimentoLogo} 
                        alt={cupomGerado.estabelecimentoNome}
                        className="h-12 w-12 sm:h-16 sm:w-16 mx-auto rounded-full object-cover mb-2 border-2 border-[hsl(45,100%,51%)]"
                      />
                    ) : (
                      <Building className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-[hsl(45,100%,51%)] mb-2" />
                    )}
                    <h2 className="text-xl sm:text-2xl font-bold text-[hsl(45,100%,51%)] drop-shadow-lg">🎂 CUPOM DE ANIVERSÁRIO</h2>
                    <p className="text-base sm:text-lg font-semibold text-[hsl(45,100%,70%)]">{cupomGerado.estabelecimentoNome}</p>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-[hsl(0,0%,8%)] rounded-lg border border-[hsl(45,100%,51%)]">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-[hsl(45,100%,51%)] mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-[hsl(45,100%,70%)]">Aniversariante</p>
                        <p className="font-semibold text-sm sm:text-base break-words text-[hsl(45,100%,70%)]">{cupomGerado.aniversarianteNome}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-[hsl(0,0%,8%)] rounded-lg border border-[hsl(45,100%,51%)]">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[hsl(45,100%,51%)] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm text-[hsl(45,100%,70%)]">Data de Nascimento</p>
                        <p className="font-semibold text-sm sm:text-base text-[hsl(45,100%,70%)]">
                          {new Date(cupomGerado.aniversarianteDataNascimento).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-[hsl(0,0%,8%)] rounded-lg border border-[hsl(45,100%,51%)]">
                      <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-[hsl(45,100%,51%)] mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-[hsl(45,100%,70%)]">Regras</p>
                        <p className="text-xs sm:text-sm break-words text-[hsl(45,100%,70%)]">{cupomGerado.regras}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 bg-[hsl(0,0%,5%)] rounded-lg border-2 border-[hsl(45,100%,51%)] text-center">
                    <p className="text-xs text-[hsl(45,100%,70%)] mb-1">Código</p>
                    <p className="text-xl sm:text-2xl font-bold text-[hsl(45,100%,51%)] font-mono tracking-wider break-all">{cupomGerado.codigo}</p>
                    <p className="text-xs text-[hsl(45,100%,70%)] mt-1">
                      Emitido: {new Date(cupomGerado.dataEmissao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="pt-3 sm:pt-4 border-t-4 border-dashed border-[hsl(45,100%,51%)]">
                    <p className="text-xs sm:text-sm text-center text-[hsl(45,100%,70%)] italic font-semibold">
                      📸 Tire print ou salve este cupom<br />
                      e apresente no estabelecimento
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="p-3 sm:p-4 border-t flex flex-col sm:flex-row gap-2 print:hidden">
              <Button onClick={handlePrintCupom} className="flex-1 h-12 text-base font-semibold">
                <Download className="mr-2 h-5 w-5" />
                Imprimir / Salvar
              </Button>
              <Button variant="outline" onClick={() => setShowCupom(false)} className="flex-1 h-12 text-base font-semibold">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Como Funciona - Aniversariante */}
      <section id="como-funciona-aniversariante" className="py-12 sm:py-16 bg-muted/50 print:hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-primary">Como Funciona para Aniversariantes</h2>
          <div className="max-w-3xl mx-auto space-y-6 text-muted-foreground">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                1. Faça seu cadastro simples
              </h3>
              <p>Crie sua conta gratuitamente na plataforma Aniversariante VIP com seus dados básicos.</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                2. Emita seus cupons
              </h3>
              <p>Navegue pelos estabelecimentos parceiros e emita cupons em quantos locais quiser, respeitando as regras de cada um.</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                3. Aproveite seus benefícios
              </h3>
              <p>Apresente o cupom no estabelecimento no dia ou período permitido e aproveite seu benefício de aniversário!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona - Estabelecimento */}
      <section id="como-funciona-estabelecimento" className="py-12 sm:py-16 print:hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-primary">Como Funciona para Estabelecimentos</h2>
          <div className="max-w-3xl mx-auto space-y-6 text-muted-foreground">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                1. Cadastre seu estabelecimento
              </h3>
              <p>Preencha seus dados, escolha a categoria (bar, restaurante, balada, loja, serviço, etc.) e informe endereço completo.</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                2. Configure dias, horários e cardápio
              </h3>
              <p>Informe seus dias e horários de funcionamento. Se tiver, adicione o link do seu cardápio digital.</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                3. Defina benefícios e regras
              </h3>
              <p>Escreva os benefícios para aniversariantes e as regras (ex.: dia válido, quantidade de pessoas, necessidade de reserva, documento, etc.).</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                4. Receba os clientes
              </h3>
              <p>Os aniversariantes cadastrados emitem cupons e visitam seu estabelecimento seguindo suas condições!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vantagens para Estabelecimentos */}
      <section id="vantagens-estabelecimentos" className="py-12 sm:py-16 bg-muted/50 print:hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-primary">Vantagens de Ser Parceiro</h2>
          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3 text-foreground">👥 Atração de Grupos</h3>
              <p className="text-muted-foreground">Um aniversariante raramente vem sozinho - traga grupos inteiros para seu estabelecimento.</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3 text-foreground">📈 Mais Movimento</h3>
              <p className="text-muted-foreground">Aumente o movimento em dias estratégicos e fortaleça sua marca.</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3 text-foreground">🎯 Marketing Direcionado</h3>
              <p className="text-muted-foreground">Presença em um guia específico de aniversários, focado no seu público-alvo.</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3 text-foreground">💰 Baixo Custo</h3>
              <p className="text-muted-foreground">Investimento muito menor comparado a outras campanhas de marketing tradicionais.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 sm:py-16 print:hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-primary">Perguntas Frequentes</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  O aniversariante precisa pagar para usar a plataforma?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Não. O cadastro é gratuito para o aniversariante. Ele pode emitir cupons em quantos estabelecimentos quiser, respeitando as regras de cada local.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  O cupom garante reserva automática?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Não necessariamente. Cada estabelecimento define suas regras. Alguns podem exigir reserva antecipada; outros funcionam por ordem de chegada. As condições aparecem na descrição de cada benefício.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Sou dono de um estabelecimento. Tenho custo para entrar?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Em breve haverá planos mensais acessíveis. No início, podemos oferecer um período promocional para você testar os resultados. O cadastro inicial serve para entrar em contato e alinhar os detalhes.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Posso alterar os benefícios ou regras depois de cadastrado?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sim. O estabelecimento pode atualizar benefícios, regras, horários e link de cardápio pela área logada da plataforma.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      </div>
      <Footer />
    </div>
  );
}
