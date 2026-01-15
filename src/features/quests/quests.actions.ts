export async function questAction({ request }: { request: Request }) {
    const formData = await request.formData();
    const data = {
        title: { en: formData.get("title_en"), ka: formData.get("title_ka") },
        expReward: Number(formData.get("exp")),
        category: formData.get("category"),
        psychotype: formData.getAll("psychotypes"), // Multiselect
    };

    const res = await fetch('/api/admin/quests', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    return res.ok;
}