import { motion } from "framer-motion";
import { UserPlus, BarChart3 } from "lucide-react";

interface EntryGateModalProps {
  onSelectJourney: (journey: "new" | "existing") => void;
}

export function EntryGateModal({ onSelectJourney }: EntryGateModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-lg mx-4 rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#0C7143]/20 to-[#00A758]/10 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-[#00A758]">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-white font-semibold text-lg">Manulife Philippines</span>
          </div>

          <h2 className="text-2xl font-bold text-white mt-6 mb-2" data-testid="text-modal-title">
            Select Client Journey
          </h2>
          <p className="text-white/70 text-sm mb-8">
            Choose how you'd like to proceed with your financial advisory session.
          </p>

          <div className="grid gap-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectJourney("new")}
              className="group flex items-center gap-4 w-full p-5 rounded-lg bg-white/10 border border-white/15 text-left transition-colors hover:bg-white/15"
              data-testid="button-new-client"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#00A758]/20 group-hover:bg-[#00A758]/30 transition-colors">
                <UserPlus className="w-6 h-6 text-[#00A758]" />
              </div>
              <div>
                <p className="font-semibold text-white text-base">New Client Discovery</p>
                <p className="text-white/60 text-sm mt-0.5">Start the Goal Wizard for new clients</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectJourney("existing")}
              className="group flex items-center gap-4 w-full p-5 rounded-lg bg-white/10 border border-white/15 text-left transition-colors hover:bg-white/15"
              data-testid="button-existing-portfolio"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#0C7143]/20 group-hover:bg-[#0C7143]/30 transition-colors">
                <BarChart3 className="w-6 h-6 text-[#0C7143] dark:text-[#00A758]" />
              </div>
              <div>
                <p className="font-semibold text-white text-base">Existing Portfolio Review</p>
                <p className="text-white/60 text-sm mt-0.5">Review and optimize current investments</p>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
