package com.staypass.core.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Directions
import androidx.compose.material.icons.filled.Fullscreen
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.staypass.core.theme.BadgeVerifiedText
import com.staypass.core.theme.PrimaryContainer
import com.staypass.core.theme.StayPassTypography

/**
 * Mock Google Maps interface card for Property Details screen.
 * Displays stylized map geometry (roads, parks, water body) for Hyderabad/Rajahmundry,
 * a Google Maps control overlay, and an interactive pinned property marker.
 */
@Composable
fun PropertyLocationMapCard(
    propertyName: String,
    locality: String,
    city: String,
    distanceText: String,
    onDirectionsClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isSatelliteMode by remember { mutableStateOf(false) }
    var zoomLevel by remember { mutableFloatStateOf(1f) }
    var showInfoBubble by remember { mutableStateOf(true) }

    val isHyderabad = city.contains("Hyderabad", ignoreCase = true)

    Card(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp)),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // Header with Title & City Badge
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Location & Neighborhood",
                        style = StayPassTypography.titleSmall,
                        color = Color(0xFF151C27)
                    )
                    Text(
                        text = "$locality • $city",
                        style = StayPassTypography.bodySmall,
                        color = Color(0xFF555E74)
                    )
                }

                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Color(0xFFEBF3FE),
                    contentColor = PrimaryContainer
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null,
                            modifier = Modifier.size(12.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(
                            text = if (isHyderabad) "Hyderabad Tech Hub" else "Rajahmundry Central",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            // Mock Google Map Viewport
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
                    .background(if (isSatelliteMode) Color(0xFF2A3928) else Color(0xFFE8ECE9))
            ) {
                // Stylized Vector Canvas drawing roads, parks, and water bodies
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val w = size.width
                    val h = size.height

                    if (isHyderabad) {
                        // Durgam Cheruvu / Lake Water Body (Blue)
                        val lakePath = Path().apply {
                            moveTo(w * 0.05f, h * 0.2f)
                            cubicTo(w * 0.15f, h * 0.1f, w * 0.35f, h * 0.15f, w * 0.45f, h * 0.35f)
                            cubicTo(w * 0.40f, h * 0.65f, w * 0.20f, h * 0.75f, w * 0.08f, h * 0.55f)
                            close()
                        }
                        drawPath(lakePath, color = if (isSatelliteMode) Color(0xFF1C2D37) else Color(0xFFA5CBE6))

                        // Green Park (Biodiversity Park)
                        drawRoundRect(
                            color = if (isSatelliteMode) Color(0xFF1B2D1B) else Color(0xFFCCEADA),
                            topLeft = Offset(w * 0.60f, h * 0.60f),
                            size = androidx.compose.ui.geometry.Size(w * 0.35f, h * 0.35f),
                            cornerRadius = androidx.compose.ui.geometry.CornerRadius(16f, 16f)
                        )

                        // Major Arterial Roads (Outer Ring Road / DLF Road)
                        val roadColor = if (isSatelliteMode) Color(0xFF474E45) else Color.White
                        val roadOutline = if (isSatelliteMode) Color(0xFF333B31) else Color(0xFFD4D8D2)

                        // Outer Ring Road Highway
                        drawLine(
                            color = roadOutline,
                            start = Offset(0f, h * 0.70f),
                            end = Offset(w, h * 0.25f),
                            strokeWidth = 14f * zoomLevel
                        )
                        drawLine(
                            color = roadColor,
                            start = Offset(0f, h * 0.70f),
                            end = Offset(w, h * 0.25f),
                            strokeWidth = 10f * zoomLevel
                        )

                        // Gachibowli - Hitec City Flyover Arterial
                        drawLine(
                            color = roadOutline,
                            start = Offset(w * 0.50f, 0f),
                            end = Offset(w * 0.50f, h),
                            strokeWidth = 12f * zoomLevel
                        )
                        drawLine(
                            color = Color(0xFFFED7AA), // Yellow/Orange primary highway
                            start = Offset(w * 0.50f, 0f),
                            end = Offset(w * 0.50f, h),
                            strokeWidth = 8f * zoomLevel
                        )
                    } else {
                        // Rajahmundry: Godavari River Curve (Wide Blue Ribbon)
                        val riverPath = Path().apply {
                            moveTo(0f, 0f)
                            cubicTo(w * 0.3f, h * 0.3f, w * 0.45f, h * 0.7f, w * 0.55f, h)
                            lineTo(0f, h)
                            close()
                        }
                        drawPath(riverPath, color = if (isSatelliteMode) Color(0xFF182833) else Color(0xFF90C0E7))

                        // Godavari Arch Bridge (Linear Rail/Road Bridge)
                        drawLine(
                            color = Color(0xFFBA1A1A),
                            start = Offset(w * 0.15f, h * 0.45f),
                            end = Offset(w * 0.85f, h * 0.45f),
                            strokeWidth = 5f * zoomLevel
                        )

                        // Danavaipeta / Main Road
                        drawLine(
                            color = if (isSatelliteMode) Color(0xFF474E45) else Color.White,
                            start = Offset(w * 0.55f, 0f),
                            end = Offset(w * 0.95f, h),
                            strokeWidth = 10f * zoomLevel
                        )
                    }
                }

                // Google Watermark (Bottom Left)
                Row(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Google",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isSatelliteMode) Color.White.copy(alpha = 0.8f) else Color(0xFF5F6368)
                    )
                }

                // Map / Satellite Switcher (Top Left)
                Surface(
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(8.dp),
                    shape = RoundedCornerShape(8.dp),
                    color = Color.White.copy(alpha = 0.95f),
                    shadowElevation = 2.dp
                ) {
                    Row(modifier = Modifier.padding(2.dp)) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(if (!isSatelliteMode) PrimaryContainer else Color.Transparent)
                                .clickable { isSatelliteMode = false }
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "Map",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (!isSatelliteMode) Color.White else Color(0xFF151C27)
                            )
                        }
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(if (isSatelliteMode) PrimaryContainer else Color.Transparent)
                                .clickable { isSatelliteMode = true }
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "Satellite",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSatelliteMode) Color.White else Color(0xFF151C27)
                            )
                        }
                    }
                }

                // Zoom & Recenter Controls (Bottom Right)
                Column(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(8.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Color.White.copy(alpha = 0.95f),
                        shadowElevation = 2.dp
                    ) {
                        Column {
                            Box(
                                modifier = Modifier
                                    .size(28.dp)
                                    .clickable { zoomLevel = (zoomLevel + 0.2f).coerceAtMost(1.8f) },
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.Add, contentDescription = "Zoom In", modifier = Modifier.size(16.dp))
                            }
                            Box(
                                modifier = Modifier
                                    .size(28.dp)
                                    .clickable { zoomLevel = (zoomLevel - 0.2f).coerceAtLeast(0.8f) },
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.Remove, contentDescription = "Zoom Out", modifier = Modifier.size(16.dp))
                            }
                        }
                    }

                    Surface(
                        shape = CircleShape,
                        color = Color.White.copy(alpha = 0.95f),
                        shadowElevation = 2.dp
                    ) {
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .clickable { zoomLevel = 1f },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.MyLocation, contentDescription = "Recenter", tint = PrimaryContainer, modifier = Modifier.size(14.dp))
                        }
                    }
                }

                // Pinned Property Marker (Centered on Pin Location)
                Box(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .padding(bottom = 20.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        if (showInfoBubble) {
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = Color(0xFF151C27),
                                shadowElevation = 4.dp
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(6.dp)
                                            .clip(CircleShape)
                                            .background(BadgeVerifiedText)
                                    )
                                    Spacer(modifier = Modifier.width(5.dp))
                                    Text(
                                        text = propertyName.take(22) + if (propertyName.length > 22) "..." else "",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                        }

                        // Google Maps Red Pin
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clickable { showInfoBubble = !showInfoBubble },
                            contentAlignment = Alignment.Center
                        ) {
                            // Pulsing radar ring
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFFEA4335).copy(alpha = 0.25f))
                            )
                            // Red marker icon
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = "Property Location Pin",
                                tint = Color(0xFFEA4335),
                                modifier = Modifier.size(30.dp)
                            )
                            // Inner white dot
                            Box(
                                modifier = Modifier
                                    .size(7.dp)
                                    .clip(CircleShape)
                                    .background(Color.White)
                                    .align(Alignment.Center)
                                    .padding(bottom = 6.dp)
                            )
                        }
                    }
                }
            }

            // Transit & Directions Footer Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Navigation,
                        contentDescription = null,
                        tint = PrimaryContainer,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Column {
                        Text(
                            text = distanceText,
                            style = StayPassTypography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF151C27)
                        )
                        Text(
                            text = if (isHyderabad) "Near Raidurg Metro & DLF Gate" else "Near Govt Arts College & RTC Bus Stand",
                            fontSize = 10.sp,
                            color = Color(0xFF555E74)
                        )
                    }
                }

                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = PrimaryContainer,
                    modifier = Modifier.clickable { onDirectionsClick() }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Directions,
                            contentDescription = "Directions",
                            tint = Color.White,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Directions",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
            }
        }
    }
}
