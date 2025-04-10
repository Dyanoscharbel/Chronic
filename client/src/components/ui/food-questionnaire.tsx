
import { Card, CardContent } from "./card"

export function FoodQuestionnaire() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">Pour te conseiller au mieux, j'ai besoin de plus d'informations ! 😊</h2>
        <p className="mb-4">Dis-moi, qu'est-ce que tu recherches ?</p>
        
        <ul className="space-y-3">
          <li>
            <span className="font-bold">Quel est ton budget ?</span>
            <span className="text-gray-600"> (Pas cher, moyen, luxe ?)</span>
          </li>
          
          <li>
            <span className="font-bold">Quel type de cuisine préfères-tu ?</span>
            <span className="text-gray-600"> (Italien, asiatique, mexicain, français, etc.)</span>
          </li>
          
          <li>
            <span className="font-bold">Es-tu pressé ou as-tu du temps pour cuisiner ?</span>
            <span className="text-gray-600"> (Rapide à préparer, plat élaboré ?)</span>
          </li>
          
          <li>
            <span className="font-bold">As-tu des restrictions alimentaires ou des allergies ?</span>
            <span className="text-gray-600"> (Végétarien, vegan, sans gluten, etc.)</span>
          </li>
          
          <li>
            <span className="font-bold">Quel est le but de ce repas ?</span>
            <span className="text-gray-600"> (Déjeuner rapide, dîner romantique, repas convivial entre amis ?)</span>
          </li>
          
          <li>
            <span className="font-bold">Qu'est-ce que tu as déjà comme ingrédients à la maison ?</span>
            <span className="text-gray-600"> (Pour éviter de te proposer quelque chose que tu ne peux pas faire)</span>
          </li>
          
          <li>
            <span className="font-bold">De quoi as-tu envie en ce moment ?</span>
            <span className="text-gray-600"> (Quelque chose de réconfortant, de léger, de nouveau ?)</span>
          </li>
        </ul>
        
        <p className="mt-4">Une fois que j'aurai ces informations, je pourrai te faire des suggestions personnalisées ! 😉</p>
      </CardContent>
    </Card>
  )
}
