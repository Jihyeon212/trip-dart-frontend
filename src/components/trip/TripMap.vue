<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import { CATEGORY_META } from '@/constants'
import type { Category, Location } from '@/types'

const props = defineProps<{ candidates: Location[]; selected: Location[]; current?: Location | null }>()
const emit = defineEmits<{ select: [location: Location] }>()
const mapElement = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let layer: L.LayerGroup | null = null

function candidateIcon(location: Location) {
  const meta = CATEGORY_META[location.category as Category]
  return L.divIcon({ className: '', html: `<span class="map-pin" style="--pin:${meta?.color || '#0f766e'}">${meta?.icon || '●'}</span>`, iconSize: [32, 38], iconAnchor: [16, 34] })
}
function selectedIcon(index: number, current: boolean) {
  return L.divIcon({ className: '', html: `<span class="confirmed-pin ${current ? 'dart-hit' : ''}">${index + 1}${current ? '<i>🎯</i>' : ''}</span>`, iconSize: [40, 44], iconAnchor: [20, 40] })
}
function draw() {
  if (!map) return
  layer?.clearLayers()
  const markers: L.Marker[] = []
  props.candidates.forEach((item) => {
    const marker = L.marker([item.latitude, item.longitude], { icon: candidateIcon(item) }).on('click', () => emit('select', item))
    marker.bindTooltip(item.title, { direction: 'top' })
    marker.addTo(layer!)
    markers.push(marker)
  })
  props.selected.forEach((item, index) => {
    const marker = L.marker([item.latitude, item.longitude], { icon: selectedIcon(index, item.contentid === props.current?.contentid) }).on('click', () => emit('select', item))
    marker.bindTooltip(item.title, { direction: 'top' }).addTo(layer!)
    markers.push(marker)
  })
  if (props.current) map.flyTo([props.current.latitude, props.current.longitude], 14, { duration: 0.8 })
  else if (markers.length) map.fitBounds(L.featureGroup(markers).getBounds().pad(0.12), { maxZoom: 13 })
}
onMounted(() => {
  if (!mapElement.value) return
  map = L.map(mapElement.value, { zoomControl: true }).setView([35.1595, 126.8526], 11)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(map)
  layer = L.layerGroup().addTo(map)
  draw()
})
watch(() => [props.candidates, props.selected, props.current] as const, draw, { deep: true })
onBeforeUnmount(() => { map?.remove(); map = null })
</script>

<template><div ref="mapElement" class="trip-map" aria-label="광주 여행 장소 지도"></div></template>
