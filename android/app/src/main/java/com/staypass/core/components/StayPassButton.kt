package com.staypass.core.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.staypass.core.theme.CardBorder
import com.staypass.core.theme.OnPrimaryContainer
import com.staypass.core.theme.PrimaryContainer
import com.staypass.core.theme.PrimaryContainerPressed
import com.staypass.core.theme.StayPassTypography

enum class ButtonVariant {
    PRIMARY,
    SECONDARY,
    OUTLINED,
    TEXT
}

@Composable
fun StayPassButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: ButtonVariant = ButtonVariant.PRIMARY,
    enabled: Boolean = true,
    isLoading: Boolean = false,
    leadingIcon: ImageVector? = null,
    trailingIcon: ImageVector? = null,
    isFullWidth: Boolean = true
) {
    val buttonModifier = modifier
        .then(if (isFullWidth) Modifier.fillMaxWidth() else Modifier)
        .defaultMinSize(minHeight = 48.dp)

    val shape = RoundedCornerShape(12.dp)

    when (variant) {
        ButtonVariant.PRIMARY -> {
            Button(
                onClick = onClick,
                modifier = buttonModifier,
                enabled = enabled && !isLoading,
                shape = shape,
                colors = ButtonDefaults.buttonColors(
                    containerColor = PrimaryContainer,
                    contentColor = OnPrimaryContainer,
                    disabledContainerColor = Color(0xFFC2C6D5),
                    disabledContentColor = Color.White
                ),
                contentPadding = PaddingValues(horizontal = 20.dp, vertical = 12.dp)
            ) {
                ButtonContent(
                    text = text,
                    isLoading = isLoading,
                    leadingIcon = leadingIcon,
                    trailingIcon = trailingIcon,
                    textColor = OnPrimaryContainer
                )
            }
        }
        ButtonVariant.SECONDARY -> {
            Button(
                onClick = onClick,
                modifier = buttonModifier,
                enabled = enabled && !isLoading,
                shape = shape,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFE7EEFE),
                    contentColor = Color(0xFF0052AC)
                ),
                contentPadding = PaddingValues(horizontal = 20.dp, vertical = 12.dp)
            ) {
                ButtonContent(
                    text = text,
                    isLoading = isLoading,
                    leadingIcon = leadingIcon,
                    trailingIcon = trailingIcon,
                    textColor = Color(0xFF0052AC)
                )
            }
        }
        ButtonVariant.OUTLINED -> {
            OutlinedButton(
                onClick = onClick,
                modifier = buttonModifier,
                enabled = enabled && !isLoading,
                shape = shape,
                border = BorderStroke(1.dp, Color(0xFFC2C6D5)),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = Color(0xFF151C27)
                ),
                contentPadding = PaddingValues(horizontal = 20.dp, vertical = 12.dp)
            ) {
                ButtonContent(
                    text = text,
                    isLoading = isLoading,
                    leadingIcon = leadingIcon,
                    trailingIcon = trailingIcon,
                    textColor = Color(0xFF151C27)
                )
            }
        }
        ButtonVariant.TEXT -> {
            TextButton(
                onClick = onClick,
                modifier = buttonModifier,
                enabled = enabled && !isLoading,
                shape = shape,
                colors = ButtonDefaults.textButtonColors(
                    contentColor = Color(0xFF0052AC)
                ),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 10.dp)
            ) {
                ButtonContent(
                    text = text,
                    isLoading = isLoading,
                    leadingIcon = leadingIcon,
                    trailingIcon = trailingIcon,
                    textColor = Color(0xFF0052AC)
                )
            }
        }
    }
}

@Composable
private fun ButtonContent(
    text: String,
    isLoading: Boolean,
    leadingIcon: ImageVector?,
    trailingIcon: ImageVector?,
    textColor: Color
) {
    if (isLoading) {
        CircularProgressIndicator(
            modifier = Modifier.size(20.dp),
            color = textColor,
            strokeWidth = 2.dp
        )
    } else {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (leadingIcon != null) {
                Icon(
                    imageVector = leadingIcon,
                    contentDescription = null,
                    tint = textColor,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
            }
            Text(
                text = text,
                style = StayPassTypography.labelLarge,
                color = textColor
            )
            if (trailingIcon != null) {
                Spacer(modifier = Modifier.width(8.dp))
                Icon(
                    imageVector = trailingIcon,
                    contentDescription = null,
                    tint = textColor,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}
