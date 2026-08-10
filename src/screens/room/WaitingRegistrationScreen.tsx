const references = [
  'Schwartz GG, Steg PG, Szarek M, Bhatt DL, Bittner VA, Diaz R, et al; ODYSSEY OUTCOMES Committees and Investigators. Alirocumab and Cardiovascular Outcomes after Acute Coronary Syndrome. N Engl J Med. 2018;379(22):2097–2107.',
  'Ference BA, Ginsberg HN, Graham I, Ray KK, Packard CJ, Bruckert E, et al. Low-density lipoproteins cause atherosclerotic cardiovascular disease. 1. Evidence from genetic, epidemiologic, and clinical studies. A consensus statement from the European Atherosclerosis Society Consensus Panel. Eur Heart J. 2017;38(32):2459–2472.',
  'Pérez de Isla L, Díaz-Díaz JL, Romero MJ, Muñiz-Grijalvo O, Mediavilla JD, Argüeso R, et al; on behalf of the SAFEHEART Study Group. Alirocumab and Coronary Atherosclerosis in Asymptomatic Patients with Familial Hypercholesterolemia: The ARCHITECT Study. Circulation. 2023;147:1436–1443.',
  'Räber L, Ueki Y, Otsuka T, Losdat S, Häner JD, Lonborg J, et al; PACMAN-AMI collaborators. Effect of Alirocumab Added to High-Intensity Statin Therapy on Coronary Atherosclerosis in Patients with Acute Myocardial Infarction: The PACMAN-AMI Randomized Clinical Trial. JAMA. 2022;327(18):1771–1781.',
  'Steg PG, Szarek M, Bhatt DL, Bittner VA, Brégeault MF, Dalby AJ, et al; ODYSSEY OUTCOMES Committees and Investigators. Effect of Alirocumab on Mortality After Acute Coronary Syndromes: An Analysis of the ODYSSEY OUTCOMES Randomized Clinical Trial. Circulation. 2019;140(2):103–112.',
  'Blumenthal RS, Lloyd-Jones DM, Braun LT, Martin SS, Navar AM, Stone NJ, et al. 2026 ACC/AHA Guideline on the Management of Dyslipidemia: A Report of the American College of Cardiology/American Heart Association Joint Committee on Clinical Practice Guidelines. J Am Coll Cardiol / Circulation. 2026.',
  'Blumenthal RS, Michos ED, Nasir K, et al. 2026 AHA/ACC/ADA/ASN Guideline for the Prevention, Detection, Evaluation, and Management of Cardiovascular-Kidney-Metabolic Syndrome: A Report of the American College of Cardiology/American Heart Association Joint Committee on Clinical Practice Guidelines. Circulation / J Am Coll Cardiol. 2026.',
  'Phillips LS, Branch WT, Cook CB, Doyle JP, El-Kebbi IM, Gallina DL, et al. Clinical inertia. Ann Intern Med. 2001;135(9):825–834.',
  'Virmani R, Burke AP, Farb A, Kolodgie FD. Pathology of the vulnerable plaque. J Am Coll Cardiol. 2006;47(8 Suppl):C13–18.',
  'Kolodgie FD, Burke AP, Farb A, Gold HK, Yuan J, Narula J, et al. The thin-cap fibroatheroma: a type of vulnerable plaque: the major precursor lesion to acute coronary syndromes. Curr Opin Cardiol. 2001;16(5):285–292.',
  'Steen DL, Ray KK, Khan I, Catapano AL, Bhatt DL, Koumas A, Pol K, Giugliano RP. Guideline-based lipid-lowering therapy in acute coronary syndromes: A simulation of population-level impact on cardiovascular events and LDL-C goal achievement. J Clin Lipidol. 2026;20(5):887–897.',
  'Bhindi R, et al. A 1% reduction in coronary atheroma volume volume decreases MACE by 20%: A meta-regression of intravascular ultrasound trials. Atherosclerosis. 2019 May;284:194–201.',
  'Pérez de Isla L, et al. Long-Term Effect of Alirocumab on Coronary Atherosclerosis Architecture and Composition: The ARCHITECT Extension Study. Circ Cardiovasc Imaging. 2024 Jan;17(1):e016206.',
]

export function WaitingRegistrationScreen() {
  return (
    <section className="flex h-full w-full items-start justify-center px-[138px] pt-[52px] text-white">
      <div className="w-full max-w-[1600px]">
        <h1 className="text-[21px] font-normal uppercase leading-none tracking-[0.38em]">
          Referencias
        </h1>

        <ul className="mt-[22px] flex flex-col gap-[18px] text-[18px] leading-[1.34]">
          {references.map((reference) => (
            <li className="flex gap-[12px]" key={reference}>
              <span aria-hidden="true" className="mt-[1px] shrink-0">
                •
              </span>
              <span>{reference}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
