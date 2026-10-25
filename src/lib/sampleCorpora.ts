export interface RawSampleCorpus {
  id: string;
  name: string;
  category: string;
  description: string;
  text: string;
}

export const SAMPLE_CORPORA: RawSampleCorpus[] = [
  {
    id: 'sample-academic',
    name: 'Academic Corpus: Computational Linguistics',
    category: 'Academic Research',
    description: 'Empirical research papers on corpus linguistics, distributional semantics, and transformer architectures.',
    text: `Corpus linguistics provides empirical methodologies for analyzing natural language patterns through large-scale authentic textual databases. Recent advances in statistical natural language processing and deep neural representations have transformed how researchers investigate syntactic constructions, lexical semantics, and grammatical variation.

In distributional semantics, words occurring within similar contextual environments tend to share latent semantic properties. The distributional hypothesis posits that the degree of semantic similarity between two linguistic units is a function of the similarity of their linguistic distributions. Modern language models learn contextualized representations by predicting masked tokens or forecasting subsequent tokens across massive corpora.

Empirical evaluation of collocation extraction demonstrates that statistical association measures exhibit distinct mathematical characteristics. Mutual Information (MI) emphasizes low-frequency, highly specific lexical associations, often highlighting technical terminology or specialized idioms. In contrast, the T-score measures the certainty of an association against the null hypothesis of independent occurrence, favoring high-frequency grammatical combinations. The LogDice metric, developed specifically for corpus lexicography in Sketch Engine, provides an unbiased measure of collocational strength that is independent of corpus size and resistant to low-frequency distortion.

Syntactic parsing and part-of-speech tagging remain critical foundational tasks. While transformer-based attention mechanisms capture complex long-range dependencies, grammatical category distinctions such as nominal pre-modification, adjectival modification, and verbal complementation continue to inform linguistic theory. Corpus-based investigations reveal that written academic prose exhibits significantly higher lexical density and nominalization rates compared to spoken registers.

Furthermore, comparative corpus analysis relies on keyness metrics such as the Log-Likelihood ratio (G2 statistic). Keyness analysis enables researchers to identify distinctive vocabulary items that occur with statistically significant frequency shifts relative to a general reference corpus. Through concordance dispersion plots and keyword-in-context (KWIC) indexing, linguists can systematically observe semantic prosody, idiomatic behavior, and stylistic idiosyncrasies across diverse textual registers.`
  },
  {
    id: 'sample-literary',
    name: 'Literary Corpus: Classic Fiction & Mystery',
    category: 'Literature & Fiction',
    description: 'Literary prose featuring classic extracts from Mary Shelley and Arthur Conan Doyle.',
    text: `It was on a dreary night of November that I beheld the accomplishment of my toils. With an anxiety that almost amounted to agony, I collected the instruments of life around me, that I might infuse a spark of being into the lifeless thing that lay at my feet. It was already one in the morning; the rain pattered dismally against the panes, and my candle was nearly burnt out, when, by the glimmer of the half-extinguished light, I saw the dull yellow eye of the creature open; it breathed hard, and a convulsive motion agitated its limbs.

How can I describe my emotions at this catastrophe, or how delineate the wretch whom with such infinite pains and care I had endeavoured to form? His limbs were in proportion, and I had selected his features as beautiful. Beautiful! Great God! His yellow skin scarcely covered the work of muscles and arteries beneath; his hair was of a lustrous black, and flowing; his teeth of a pearly whiteness; but these luxuriances only formed a more horrific contrast with his watery eyes, that seemed almost of the same colour as the dun-white sockets in which they were set, his shrivelled complexion and straight black lips.

Sherlock Holmes took his bottle from the corner of the mantelpiece and his hypodermic syringe from its neat morocco case. With his long, white, nervous fingers he adjusted the delicate needle, and rolled back his left shirtcuff. For some little time his eyes rested thoughtfully upon the sinewy forearm and wrist all dotted and scarred with innumerable puncture-marks. Finally he thrust the sharp point home, pressed down the tiny piston, and sank back into the velvet-lined arm-chair with a long sigh of satisfaction.

Three times a day for many months I had witnessed this performance, but custom had not reconciled my mind to it. On the contrary, from day to day I had become more irritable at the sight, and my conscience swelled nightly within me at the thought that I had lacked the courage to protest. Again and again I had registered a vow that I should deliver my mind upon the subject, but there was that in the cool, nonchalant air of my companion which made him the last man with whom one would care to take anything approaching to a liberty.`
  },
  {
    id: 'sample-journalism',
    name: 'Journalism Corpus: Technology & Global Trends',
    category: 'News & Media',
    description: 'Investigative technology and economics journalism exploring digital transformation and labor.',
    text: `Across the global technology landscape, unprecedented capital investment is reshaping automated workflows and enterprise infrastructure. From silicon manufacturing centers in East Asia to cloud computing hubs across North America, organizations are racing to deploy scalable neural systems capable of processing vast data streams in real time.

Industry analysts emphasize that enterprise integration requires substantial architectural shifts. Legacy systems, often maintained over decades by cautious IT departments, struggle to accommodate the throughput demands of distributed machine learning pipelines. Consequently, Chief Information Officers face intense pressure to modernize legacy databases while ensuring continuous compliance with evolving data sovereignty frameworks.

The economic implications extend far beyond server rooms and data centers. Labor economists note that cognitive automation is beginning to affect knowledge workers in financial modeling, legal research, and regulatory compliance. Rather than replacing entire professional roles overnight, these tools function primarily as cognitive augmentations, accelerating pattern recognition and draft generation while demanding greater oversight and verification from human specialists.

Environmental concerns have simultaneously emerged as a central pillar of technological governance. Power consumption at high-density computing facilities has prompted regional utilities to reassess electrical grid capacities. Clean energy procurement and water-cooling efficiency have transitioned from corporate social responsibility talking points into existential operational necessities for major infrastructure operators worldwide.`
  }
];
