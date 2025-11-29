// src/components/OrderStatusBar.jsx
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Truck } from "lucide-react";

const steps = [
  { key: "confirmado", label: "Recibido", icon: CheckCircle2 },
  { key: "preparando", label: "Preparando", icon: Loader2 },
  { key: "listo", label: "Listo para recoger", icon: Truck },
];

const getStepIndex = (status) => {
  if (status === "preparando") return 1;
  if (status === "listo" || status === "entregado") return 2;
  return 0;
};

const OrderStatusBar = ({ status }) => {
  const activeIndex = getStepIndex(status);

  return (
    <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isDone = index < activeIndex;
          const isActive = index === activeIndex;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center flex-shrink-0">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0.7 }}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    opacity: isDone || isActive ? 1 : 0.4,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    isDone || isActive
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-gray-300 bg-gray-50 text-gray-400"
                  }`}
                >
                  <Icon size={24} className={isActive ? "animate-pulse" : ""} />
                </motion.div>
                <span
                  className={`mt-2 text-xs font-semibold ${
                    isDone || isActive ? "text-emerald-700" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <motion.div
                  className="flex-1 h-1 mx-2 rounded-full bg-gray-200 overflow-hidden"
                  initial={false}
                >
                  <motion.div
                    className="h-1 bg-emerald-500"
                    animate={{
                      width:
                        activeIndex > index
                          ? "100%"
                          : activeIndex === index
                          ? "50%"
                          : "0%",
                    }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusBar;