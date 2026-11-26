const PILLARS = [
  {
    number: '01',
    title: 'Lived Experience & Genuine Fellowship',
    highlight: '24/7 peer mentorship for both women and men',
    description:
      'TLC Recovery House is run by grateful recovering addicts in long-term recovery. Because we have lived through addiction, shame, and starting over, both women and men are met with zero judgment, honest accountability, and 24/7 peer mentorship that helps you breathe again.',
  },
  {
    number: '02',
    title: 'Daily Recovery Meetings & Community',
    highlight: 'NA, AA, CA & RU meetings plus sponsor support',
    description:
      'Recovery grows in fellowship. Residents attend daily NA, AA, CA, and RU meetings, work closely with sponsors, have access to welcoming local church options, and travel together to regional sober events across North Alabama.',
  },
  {
    number: '03',
    title: 'State-Certified Life Skills Classes',
    highlight: 'Partnered with Phyllis Klaiber via The Link in Cullman, AL',
    description:
      'Healing requires practical tools for everyday life. Through our partnership with licensed, state-certified life coach Phyllis Klaiber via The Link out of Cullman, AL, residents earn state-certified certificates in Healthy Boundaries, Parenting, and Anger Management.',
  },
  {
    number: '04',
    title: 'Gainful Employment & Lasting Independence',
    highlight: '9-month foundation, Grad House & Josiah House',
    description:
      'From our 9-month structured foundation and TLC Grad House step-down for women to our dedicated men’s programming at TLC Josiah House, residents secure gainful employment, rebuild trust with family, and learn to live life on life’s terms.',
  },
];

export function TlcDifference() {
  return (
    <section id="difference" className="bg-[#F2ECE1] border-y border-[#E4DDD1] py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-[#B85D43]">
            The TLC Difference
          </p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#24201E]">
            Peer-Led Structure Rooted in Dignity, Faith, and Practical Healing.
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#57514D]">
            We don&rsquo;t offer a cold clinical facility. Across our women&rsquo;s and men&rsquo;s residences, we offer real homes where structure protects your sobriety and genuine fellowship walks you through the hard days.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.number}
              className="bg-[#FAF7F2] border border-[#E4DDD1] rounded-2xl p-7 sm:p-8 flex flex-col justify-between shadow-[0_2px_14px_rgba(36,32,30,0.03)]"
            >
              <div>
                <div className="flex items-baseline justify-between gap-4 pb-4 border-b border-[#E4DDD1]">
                  <span className="font-serif text-2xl font-semibold tabular-nums text-[#C98A3A]">
                    {pillar.number}.
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#5B7B6D] text-right">
                    {pillar.highlight}
                  </span>
                </div>

                <h3 className="mt-5 font-serif text-2xl font-semibold text-[#24201E] leading-snug">
                  {pillar.title}
                </h3>

                <p className="mt-3 text-base leading-relaxed text-[#57514D]">
                  {pillar.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
