import type { CourseAbout } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, ord, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'La raison pour laquelle, le projet auquel je participe, l’entreprise pour laquelle je travaille, le parc près duquel nous habitons: compound relative pronouns are essential for precise, formal sentences at C1, in reports, letters and essays. This course teaches lequel and its forms after a preposition, the contractions auquel and duquel, the choice between dont and duquel, and the elegant use of quoi (ce à quoi, ce sur quoi).',
    'La raison pour laquelle, le projet auquel je participe, l’entreprise pour laquelle je travaille, le parc près duquel nous habitons : les pronoms relatifs composés sont indispensables pour des phrases précises et soutenues au niveau C1, dans les rapports, les lettres et les dissertations. Ce cours présente lequel et ses formes après une préposition, les contractions auquel et duquel, le choix entre dont et duquel, et l’emploi élégant de quoi (ce à quoi, ce sur quoi).',
  ),
  outcomes: [
    b('Use preposition + lequel / laquelle / lesquels / lesquelles', 'Employer préposition + lequel / laquelle / lesquels / lesquelles'),
    b('Contract with à and de: auquel, duquel', 'Contracter avec à et de : auquel, duquel'),
    b('Choose between dont and duquel', 'Choisir entre dont et duquel'),
    b('Use ce à quoi, ce sur quoi', 'Employer ce à quoi, ce sur quoi'),
  ],
};

const C = 'complex-relatives';
export default [
  lesson(C, 1, ['preposition-lequel', 'preposition-lequel'],
    b('Avec lequel, pour laquelle, sur lesquels', 'Avec lequel, pour laquelle, sur lesquels'),
    b('After a preposition, use lequel agreeing with the noun (qui for people is possible).', 'Après une préposition, employer lequel accordé avec le nom (qui est possible pour les personnes).'),
    [b('Agree lequel with its antecedent', 'Accorder lequel avec son antécédent'), b('Use qui for people after a preposition', 'Employer qui pour les personnes après une préposition'), b('Use la raison pour laquelle', 'Employer la raison pour laquelle')],
    13,
    [
      card(b('Preposition + lequel', 'Préposition + lequel'), b('After **avec, pour, sans, sur, sous, chez, parmi, entre…**, use **lequel, laquelle, lesquels, lesquelles** (agreeing with the noun). For people, **qui** is also possible: **la collègue avec qui / avec laquelle je travaille**. After **parmi** and **entre**, always lequel: **les candidats parmi lesquels…**', 'Après **avec, pour, sans, sur, sous, chez, parmi, entre…**, employez **lequel, laquelle, lesquels, lesquelles** (accordé avec le nom). Pour les personnes, **qui** est aussi possible : **la collègue avec qui / avec laquelle je travaille**. Après **parmi** et **entre**, toujours lequel : **les candidats parmi lesquels…**'), {
        ex: [['L’entreprise pour laquelle je travaille est canadienne.', 'The company I work for is Canadian.'], ['C’est la raison pour laquelle je suis venu.', 'That’s the reason why I came.'], ['Les outils avec lesquels nous travaillons sont anciens.', 'The tools we work with are old.']],
      }),
      mc(P.word, ['laquelle', 'lequel', 'lesquelles', 'que'], { fr: 'La table sur ___ j’ai posé mes clés a disparu !' }),
      mc(P.word, ['lesquels', 'qui', 'lesquelles', 'dont'], { fr: 'Les dossiers parmi ___ vous devez choisir sont sur mon bureau.' }),
      mc(P.word, ['pour laquelle', 'pourquoi', 'dont', 'que'], { fr: 'C’est la raison ___ j’ai quitté mon emploi.' }),
      sort(b('Which form of lequel?', 'Quelle forme de lequel ?'), ['lequel', 'laquelle', 'lesquels', 'lesquelles'], [['le stylo avec …', 0], ['la clé sans …', 1], ['les amis chez …', 2], ['les règles selon …', 3], ['le pont sous …', 0], ['la cause pour …', 1]]),
      gap(P.complete, 'Voici l’équipe avec ___ je collabore et le projet pour ___ nous avons obtenu un financement.', [['laquelle', 'qui'], 'lequel']),
      ord(P.order, 'Le cours pour lequel je me suis inscrit commence lundi.', { tr: 'The course I signed up for starts on Monday.' }),
      say('C’est la raison pour laquelle j’ai choisi de m’installer à Québec.', 'That’s the reason why I chose to settle in Québec City.'),
    ],
    [
      b('preposition + lequel / laquelle / lesquels / lesquelles (agreement with the noun).', 'préposition + lequel / laquelle / lesquels / lesquelles (accord avec le nom).'),
      b('For people: preposition + qui is also possible (avec qui).', 'Pour les personnes : préposition + qui aussi possible (avec qui).'),
      b('parmi, entre + lesquels / lesquelles only.', 'parmi, entre + lesquels / lesquelles uniquement.'),
    ],
    [['un financement', b('funding', 'apport d’argent')], ['collaborer', b('to collaborate', 'travailler ensemble')], ['s’installer', b('to settle', 'se fixer quelque part')]],
  ),
  lesson(C, 2, ['auquel-duquel', 'auquel-duquel'],
    b('Auquel, duquel: contractions', 'Auquel, duquel : les contractions'),
    b('Contract à and de with lequel, and choose between dont and duquel.', 'Contracter à et de avec lequel, et choisir entre dont et duquel.'),
    [b('Use auquel, à laquelle, auxquels, auxquelles', 'Employer auquel, à laquelle, auxquels, auxquelles'), b('Use duquel after a compound preposition', 'Employer duquel après une préposition composée'), b('Choose dont or duquel', 'Choisir entre dont et duquel')],
    13,
    [
      card(b('À + lequel', 'À + lequel'), b('With verbs built with **à** (penser à, participer à, s’intéresser à, faire face à): **auquel, à laquelle, auxquels, auxquelles**. **Le projet auquel je participe. La conférence à laquelle j’ai assisté.**', 'Avec les verbes construits avec **à** (penser à, participer à, s’intéresser à, faire face à) : **auquel, à laquelle, auxquels, auxquelles**. **Le projet auquel je participe. La conférence à laquelle j’ai assisté.**'), {
        ex: [['Les difficultés auxquelles nous faisons face sont nombreuses.', 'The difficulties we face are numerous.']],
      }),
      card(b('Dont or duquel?', 'Dont ou duquel ?'), b('A simple **de** (parler de, avoir besoin de): **dont**. A **compound preposition** ending in de (près de, à côté de, au cours de, à cause de, en face de): **duquel, de laquelle, desquels, desquelles**. **Le parc près duquel j’habite. La réunion au cours de laquelle il a démissionné.**', 'Un simple **de** (parler de, avoir besoin de) : **dont**. Une **préposition composée** terminée par de (près de, à côté de, au cours de, à cause de, en face de) : **duquel, de laquelle, desquels, desquelles**. **Le parc près duquel j’habite. La réunion au cours de laquelle il a démissionné.**'), {
        ex: [['Le livre dont je t’ai parlé.', 'The book I told you about.'], ['L’immeuble en face duquel il y a une école.', 'The building opposite which there is a school.']],
      }),
      mc(P.word, ['auquel', 'duquel', 'dont', 'lequel'], { fr: 'C’est un détail ___ je n’avais pas pensé.' }),
      mc(P.word, ['près duquel', 'dont près', 'près de quoi', 'près lequel'], { fr: 'Le lac ___ nous avons loué un chalet est magnifique.' }),
      mc(P.word, ['dont', 'duquel', 'auquel', 'que'], { fr: 'Voici le logiciel ___ nous avons besoin.' }),
      pairs(P.match, [['penser à → auquel', b('the thing I think about', 'ce à quoi je pense')], ['parler de → dont', b('the thing I talk about', 'ce dont je parle')], ['à côté de → duquel', b('next to which', 'à proximité')], ['au cours de → de laquelle', b('during which', 'pendant laquelle')]]),
      doc({ title: b('Report extract', 'Extrait de rapport'), text: 'Le comité, auquel ont participé douze experts, a remis ses conclusions. La réunion au cours de laquelle elles ont été présentées a duré quatre heures. Les solutions dont le rapport fait état exigent un financement important.' }, P.read, [b('Twelve experts took part in the committee.', 'Douze experts ont participé au comité.'), b('The meeting lasted twelve hours.', 'La réunion a duré douze heures.'), b('The solutions are cheap.', 'Les solutions coûtent peu.'), b('The committee rejected the report.', 'Le comité a rejeté le rapport.')]),
      dict('La conférence à laquelle j’ai assisté portait sur l’intelligence artificielle.', { voice: 'f' }),
    ],
    [
      b('à + lequel → auquel, auxquels, auxquelles (à laquelle stays).', 'à + lequel → auquel, auxquels, auxquelles (à laquelle ne change pas).'),
      b('Simple de → dont; compound preposition + de → duquel.', 'de simple → dont ; préposition composée + de → duquel.'),
      b('au cours duquel, près duquel, à côté de laquelle, en face desquels.', 'au cours duquel, près duquel, à côté de laquelle, en face desquels.'),
    ],
    [['faire face à', b('to face', 'affronter')], ['un logiciel', b('software', 'programme informatique')], ['faire état de', b('to mention, to report', 'mentionner')]],
  ),
  lesson(C, 3, ['ce-a-quoi', 'ce-a-quoi'],
    b('Ce à quoi, ce sur quoi, ce dont', 'Ce à quoi, ce sur quoi, ce dont'),
    b('Refer to a whole idea with ce + preposition + quoi.', 'Reprendre une idée entière avec ce + préposition + quoi.'),
    [b('Use ce à quoi and ce sur quoi', 'Employer ce à quoi et ce sur quoi'), b('Use ce dont', 'Employer ce dont'), b('Use quoi after a preposition for an idea', 'Employer quoi après une préposition pour une idée')],
    13,
    [
      card(b('A whole idea', 'Une idée entière'), b('When the antecedent is an **idea** or **ce**, use **quoi** after a preposition: **ce à quoi je pense** (what I’m thinking about), **ce sur quoi nous sommes d’accord**, **ce contre quoi il se bat**. With a simple de: **ce dont j’ai besoin**.', 'Quand l’antécédent est une **idée** ou **ce**, employez **quoi** après une préposition : **ce à quoi je pense**, **ce sur quoi nous sommes d’accord**, **ce contre quoi il se bat**. Avec un de simple : **ce dont j’ai besoin**.'), {
        ex: [['Ce à quoi je ne m’attendais pas, c’est sa réaction.', 'What I didn’t expect was his reaction.'], ['Il a fini son discours, après quoi tout le monde a applaudi.', 'He finished his speech, after which everyone applauded.']],
      }),
      tip(b('Sans quoi, après quoi, faute de quoi', 'Sans quoi, après quoi, faute de quoi'), b('Formal links referring to the previous sentence: **Signez avant lundi, faute de quoi votre dossier sera refusé.**', 'Liens soutenus qui reprennent la phrase précédente : **Signez avant lundi, faute de quoi votre dossier sera refusé.**')),
      mc(P.word, ['ce à quoi', 'ce que', 'ce dont', 'à ce qui'], { fr: 'Le télétravail, c’est exactement ___ j’aspire.' }),
      mc(P.word, ['ce dont', 'ce que', 'ce à quoi', 'dont ce'], { fr: 'Dites-moi ___ vous avez besoin.' }),
      mc(P.word, ['faute de quoi', 'grâce à quoi', 'après lequel', 'dont'], { fr: 'Veuillez confirmer votre présence, ___ votre place sera attribuée à quelqu’un d’autre.' }),
      sort(b('Which relative?', 'Quel relatif ?'), ['ce que', 'ce dont', 'ce à quoi'], [['… je veux', 0], ['… je rêve', 1], ['… je pense', 2], ['… tu parles', 1], ['… il s’intéresse', 2], ['… nous proposons', 0]]),
      gap(P.complete, 'Voilà ___ ___ nous devons réfléchir avant la réunion.', ['ce', 'à quoi']),
      say('Ce sur quoi nous sommes tous d’accord, c’est la nécessité d’agir rapidement.', 'What we all agree on is the need to act quickly.'),
    ],
    [
      b('ce + preposition + quoi for an idea: ce à quoi, ce sur quoi, ce contre quoi.', 'ce + préposition + quoi pour une idée : ce à quoi, ce sur quoi, ce contre quoi.'),
      b('ce dont = what … of / about (simple de).', 'ce dont = de + idée (de simple).'),
      b('Links: après quoi, sans quoi, faute de quoi.', 'Liens : après quoi, sans quoi, faute de quoi.'),
    ],
    [['aspirer à', b('to aspire to', 'désirer fortement')], ['s’attendre à', b('to expect', 'prévoir')], ['attribuer', b('to allocate, to give', 'donner')]],
  ),
];
