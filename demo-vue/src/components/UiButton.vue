<script setup lang="ts">
defineProps<{
  size?: 'mini' | 'tiny' | 'small' | 'normal' | 'large'
  variant?: 'default' | 'transparent' | 'red' | 'green' | 'blue'
  title?: string
}>()
</script>

<template>
  <button 
    class="ui-button" 
    :class="[size, variant]"
    :title="title"
  >
    <span class="inner">
      <slot></slot>
    </span>
  </button>
</template>

<style scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
  outline: 0;
  flex: none;
  margin: 0 0.25em 0 0;
  min-width: 20px;
  border: 1px solid #171717;
  border-radius: 3px;
  font-weight: 700;
  font-family: inherit;
  font-size: 1rem;
  height: 26px;
  line-height: 1em;
  overflow: hidden;
  text-align: center;
  text-decoration: none;
  text-overflow: ellipsis;
  cursor: pointer;
  color: #bdbdbd;
  background-image: linear-gradient(#4e4e4e, #4e4e4e);
}

.ui-button:last-child {
  margin-right: 0;
}

.inner {
  box-sizing: border-box;
  height: 100%;
  padding: 0 1.5em;
  border-radius: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ui-button:hover {
  background-image: linear-gradient(#585858, #585858);
  color: #d1d1d1;
}

.ui-button:active {
  color: #8b8b8b;
  background: #3a3a3a;
}

.ui-button:active .inner {
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.5);
}

/* 尺寸变体 */
.ui-button.mini {
  font-size: 0.66666667rem;
  height: 18px;
}

.ui-button.tiny {
  font-size: 0.91666667rem;
  height: 21px;
}

.ui-button.tiny .inner {
  line-height: 12px;
}

.ui-button.small {
  font-size: 0.91666667rem;
  height: 24px;
}

.ui-button.large {
  font-size: 1.16666667rem;
  height: 29px;
}

/* 颜色变体 */
.ui-button.red {
  color: #ddd;
  background-image: linear-gradient(#b54344, #b54344);
}

.ui-button.red:hover {
  background-image: linear-gradient(#bf4d4e, #bf4d4e);
  color: #f1f1f1;
}

.ui-button.green {
  color: #fff;
  background-image: linear-gradient(#6b9e51, #6b9e51);
}

.ui-button.green:hover {
  background-image: linear-gradient(#75a85b, #75a85b);
}

.ui-button.blue {
  color: #fff;
  background-image: linear-gradient(#4281b6, #4281b6);
}

.ui-button.blue:hover {
  background-image: linear-gradient(#4c8bc0, #4c8bc0);
}

/* 透明变体 */
.ui-button.transparent {
  background: transparent;
  border: 0;
}

.ui-button.transparent .inner {
  border: 0;
  padding: 0.4em 0.6em;
}

.ui-button.transparent:hover {
  color: #d1d1d1;
  background: #585858;
}

.ui-button.transparent:active {
  color: #8b8b8b;
  background: #3a3a3a;
}

.ui-button.transparent:active .inner {
  box-shadow: none;
}
</style>

