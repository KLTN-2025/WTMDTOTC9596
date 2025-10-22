export const fetchProvinces = async () => {
  try {
    const response = await fetch('https://provinces.open-api.vn/api/v1/')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching provinces:', error)
    throw error
  }
}
