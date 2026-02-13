export const scrollToParagraph = async (targetId) => {
  await Word.run(async (context) => {
    const paragraphs = context.document.body.paragraphs;
    paragraphs.load("uniqueLocalId");
    await context.sync();

    const targetParagraph = paragraphs.items.find((paragraph) => paragraph.uniqueLocalId === targetId);
    if (targetParagraph) {
      targetParagraph.select(Word.SelectionMode.select);
    } else {
      console.warn("Paragraph with ID not found in this session.");
    }

    await context.sync();
  });
}

export const scrollToTextInParagraph = async (targetId, text) => {
  await Word.run(async (context) => {
    const paragraphs = context.document.body.paragraphs;
    paragraphs.load("uniqueLocalId");
    await context.sync();

    const targetParagraph = paragraphs.items.find((paragraph) => paragraph.uniqueLocalId === targetId);
    if (targetParagraph) {
      const results = targetParagraph.search(
        text.substring(0, 255),
        { matchCase: false, ignorePunct: true, ignoreSpace: true }
      );
      results.load("items");
      await context.sync();

      let range = results.items.length > 0 ? results.items[0] : targetParagraph;
      range.select(Word.SelectionMode.select);
    } else {
      console.warn("Paragraph with ID not found in this session.");
    }

    await context.sync();
  });
}
