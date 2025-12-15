// src/components/estabelecimento/BenefitCard.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Calendar, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BenefitCardProps {
  beneficio: string;
  validadeTexto?: string;
  regras?: string;
  estabelecimentoId: string;
  userId: string | null;
  isModalOpen?: boolean;
  onModalOpenChange?: (open: boolean) => void;
}

const BenefitCard = ({
  beneficio,
  validadeTexto = "mes_aniversario",
  regras,
  estabelecimentoId,
  userId,
  isModalOpen = false,
  onModalOpenChange,
}: BenefitCardProps) => {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const modalOpen = onModalOpenChange ? isModalOpen : internalModalOpen;
  const setModalOpen = onModalOpenChange || setInternalModalOpen;

  const getValidadeDisplay = (validade: string) => {
    const map: Record<string, string> = {
      dia_aniversario: "No dia do aniversário",
      semana_aniversario: "Na semana do aniversário",
      mes_aniversario: "No mês do aniversário",
    };
    return map[validade] || validade;
  };

  const handleVerBeneficio = () => {
    if (!userId) {