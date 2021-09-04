export const HelpMessageLfs = (channel: string) =>
  `
  Jei norite susirasti squadą - prisijunkite prie voice kanalo ir rašykite \`lfs\` arba \`+\` kanale ${channel}. Jei esate vienas - nebūtina būti voice kanale. Norėdami pakviesti ar prisijungti - spauskite ant ikonos ✉️ ir botas 🤖 pabus tarpininku kuris padės jum susitarti.
  Norėdami ištrinti paskutinę savo paieškos žinutę rašykite \`-\`
  Norėdami pridėti žinutę prie lfs ar + rašykite \`lfs "max 120 simbolių žinutė"\`
`;

export const HelpMessageDefault = (rolesChannel: string, lfsChannel: string, availableRoles: string[]) => `
Sveiki, aš PUBG LT bendruomenės botas 🤖, padedantis gauti roles ir susirasti squadą PUBG LT discorde.
Norėdami gauti savo roles priklausančias pagal statistiką: parašykite kanale ${rolesChannel} \`/link PUBG_NICKNAME\`, kur \`PUBG_NICKNAME\` tiksliai atitinka jūsų ingame character name.
Norėdami atnaujinti statistiką naudokite \`/update\` kanale ${rolesChannel}

${HelpMessageLfs(lfsChannel)}

Jei reik boto pagalbos - naudokite \`/help\`
`;

export const HelpMessageAdmin = () => `

Papildomos admin komandos:
\`/link PUBG_NICKNAME DISCORD_ID\` - prijungti PUBG_NICKNAME prie DISCORD_ID (jei pubg acc buvo prikabintas prie kito userio, to userio roles bus nuimtos)

\`/unlink PUBG_NICKNAME\` - atsieti pubg accounta nuo discordo accounto, roles bus nuimtos

Taip pat šiame kanale matysis klaidos ir informaciniai pranešimai iš boto.
`;
