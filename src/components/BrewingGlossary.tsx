/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Beaker, Flame, Award } from "lucide-react";

export default function BrewingGlossary() {
  const [isOpen, setIsOpen] = useState(false);

  const entries = [
    {
      title: "Початкова щільність (OG — Original Gravity)",
      icon: <Beaker className="w-5 h-5 text-[#FF9F1C]" />,
      desc: "Щільність пивного сусла перед внесенням дріжджів. Вона вимірює концентрацію розчинених цукрів (переважно мальтози з солоду). Одиниця виміру Brix (°Bx) показує відсотковий вміст цукру за вагою у водному розчині. Чим вище початкова щільність, тим міцнішим та щільнішим потенційно буде пиво."
    },
    {
      title: "Базова зброджуваність дріжджів (Yeast Attenuation)",
      icon: <Award className="w-5 h-5 text-[#FF9F1C]" />,
      desc: "Відсоток цукрів із сусла, який штам дріжджів здатний переробити на алкоголь та вуглекислий газ за стандартних умов затирання. Кожен штам дріжджів має паспортні параметри (наприклад, щільні ельові дріжджі зброджують 72-76%, тоді як нейтральні лагерні або бельгійські можуть сягати 80-84%)."
    },
    {
      title: "Спецсолоди та несолоджена сировина (Adjuncts)",
      icon: <BookOpen className="w-5 h-5 text-[#FF9F1C]" />,
      desc: "Несолоджені пластівці (овес, пшениця, кукурудза), карамельні чи палені солоди, солодке сухе молоко (лактоза). Ці добавки містять декстрини або незброджувані цукри, які дріжджі не можуть розщепити. Їхня висока частка в засипу безпосередньо збільшує кінцеву щільність (робить пиво більш густим та солодким)."
    },
    {
      title: "Паузи затирання (Mashing Pauses)",
      icon: <Flame className="w-5 h-5 text-[#FF9F1C]" />,
      desc: "Вплив ферментів пивоварного солоду на розщеплення крохмалю. За нижчої температури (61-65°C) активується бета-амілаза, створюючи зброджувану мальтозу (пиво виходить сухим та міцним). За вищої (68-72°C) активна альфа-амілаза, яка формує декстрини (пиво отримує повнотілість, солодкість та менший алкоголь)."
    }
  ];

  return (
    <div className="bg-[#121826] rounded-3xl border border-[#1E2638] overflow-hidden shadow-2xl transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-[#1E2638]/40 text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="bg-[#FF9F1C]/10 p-2.5 rounded-xl border border-[#FF9F1C]/20">
            <BookOpen className="w-5 h-5 text-[#FF9F1C]" />
          </div>
          <div>
            <h3 className="font-serif font-black text-white text-lg leading-tight">
              Енциклопедія броваря
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Дізнайтеся більше про те, як розраховується та формується кінцева щільність пива
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="text-[#FF9F1C]" /> : <ChevronDown className="text-[#FF9F1C]" />}
      </button>

      {isOpen && (
        <div className="p-5 border-t border-[#1E2638] bg-[#0B0F19]/55 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entries.map((entry, idx) => (
              <div key={idx} className="bg-[#0B0F19] p-4 rounded-2xl border border-[#1E2638] flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  {entry.icon}
                  <h4 className="font-serif font-bold text-white text-sm leading-tight">
                    {entry.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {entry.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="p-3.5 bg-[#FF9F1C]/10 border border-[#FF9F1C]/20 rounded-xl text-center text-xs text-slate-200 font-sans leading-relaxed">
            💡 <strong>Порада від експерта:</strong> Для класичного сухого затирання (West Coast IPA, Pilsner) тримайте температуру першої паузи в діапазоні 62-64°C найдовше. Якщо ви варите Milk Stout або Baltic Porter — затирайте ближче до 68-70°C, або піднімайте відсоток спецсолодів {`>`}20% для насиченого солодкого шоколадно-кавового профілю.
          </div>
        </div>
      )}
    </div>
  );
}
